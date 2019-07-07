import { AudinoOptions } from './options'
import { getSortedStreams, attachMediaType } from '../src/utils'
import { 
  ContextResumeError,
  NoPlayableSourceError,
  NoStreamsProvidedError,
} from './errors'
import { 
  IAudino,
  IAudioWrapper,
  IAudinoOptions,
  IStreamDefinition,
  MediaSourceHookEnum,
} from './interfaces'

/**
 * Main API. Service/Module Injection Coordinator.
 */
export class Audino implements IAudino {
  private _volume: number
  private options: IAudinoOptions
  
  private audioNode: AudioNode // @TODO make a module?
  private audioContext: AudioContext
  private audioElement: IAudioWrapper

  constructor (
    options: IAudinoOptions = new AudinoOptions(),
  ) {
    this._volume = 1 // Preserve volume been streams
    this.options = options
    
    // Load modules
    this.audioContext = options.modules.createAudioContext()
    this.audioElement = options.modules.createAudioWrapper()
  }

  public static makePlayerOptions = () => {
    // Alternative to importing the options class
    return new AudinoOptions()
  }

  public get emitter () {
    // Expose to allow subscriptions
    return this.options.services.Emitter
  }

  public get src () {
    return this.audioElement.src
  }

  public get volume (): number {
    return this._volume
  }

  public set volume (volume: number) {
    this.audioElement.volume = volume
    this._volume = volume
  }

  private tryCreateAudioNode = () => {
    try {
      if (!this.audioNode) {
        this.audioNode = this.audioElement.getAudioNode(this.audioContext)
        this.audioNode.connect(this.audioContext.destination)
      }

    } catch (ex) {
      console.error(ex)
      this.audioNode = null
    }
  }

  private resumeContext = async () => {
    try {
      // We want to remove the source when we resume,
      // as offline stations will hang the resume if they
      // are the current source.
      const stagedSource = this.audioElement.src
      this.audioElement.src = ''
      await (this.audioNode.context as AudioContext).resume()
      this.audioElement.src = stagedSource
    } catch (ex) {
      throw new ContextResumeError()
    }
  }

  private beforePlay = async () => {
    // If the context was create onload before user interaction
    // the context will be in a suspended state
    if (this.audioNode && this.audioNode.context && this.audioNode.context.state === 'suspended') {
      await this.resumeContext()
    }
  }

  public play = async () => {
    const emitter = this.options.services.Emitter
  
    await this.beforePlay()
    await emitter.$emit(MediaSourceHookEnum.BEFORE_PLAY)
    await this.audioElement.play()
    await emitter.$emit(MediaSourceHookEnum.AFTER_PLAY)
  }

  public pause = async () => {
    const emitter = this.options.services.Emitter
  
    await emitter.$emit(MediaSourceHookEnum.BEFORE_PAUSE)
    await this.audioElement.pause()
    await emitter.$emit(MediaSourceHookEnum.AFTER_PAUSE)
  }

  public loadStream = async (
    rawStreams: IStreamDefinition|IStreamDefinition[], 
    priority: string[] = [],
  ) => {
    // Create input streams
    let streams = Array.isArray(rawStreams) ? rawStreams : [rawStreams]

    // Check for streams
    if (!streams || streams.length === 0) {
      throw new NoStreamsProvidedError()
    }

    // Sort and apply flags where needed
    streams = getSortedStreams(streams, priority)
      .map((s) => attachMediaType(s, this.options.typeMap))

    // Find the first playable source
    const stream = streams.find((s) => {
      return this.audioElement.canPlayType(s.mediaType || '') !== ''
    })

    // Check that there is a playable streams
    if (!stream) {
      throw new NoPlayableSourceError(streams)
    }

    // Do not change audio stream if url has not changed
    if (this.audioElement.src !== stream.url) {
      // Set stream
      this.audioElement.src = stream.url

      // Attempt to create source
      this.tryCreateAudioNode()
    }

    // Autoplay
    if (this.options.autoPlay) {
      await this.play()
    }
  }
}