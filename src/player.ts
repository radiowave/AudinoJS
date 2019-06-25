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
  
  private ctx: AudioContext
  private source: AudioNode // @TODO make a module?
  private audio: IAudioWrapper

  constructor (
    options: IAudinoOptions = new AudinoOptions(),
  ) {
    this._volume = 1 // Preserve volume been streams
    this.options = options
    
    // Load modules
    this.ctx = options.modules.createAudioContext()
    this.audio = options.modules.createAudioWrapper()
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
    return this.audio.src
  }

  public get volume (): number {
    return this._volume
  }

  public set volume (volume: number) {
    this.audio.volume = volume
    this._volume = volume
  }

  private tryCreateSource = () => {
    try {
      if (!this.source) {
        this.source = this.audio.getContextSource(this.ctx)
        this.source.connect(this.ctx.destination)
      }
    } catch (ex) {
      console.error(ex)
      this.source = null
    }
  }

  private resumeContext = async () => {
    try {
      await this.source.context.resume()
    } catch (ex) {
      throw new ContextResumeError()
    }
  }

  private beforePlay = async () => {
    // If the context was create onload before user interaction
    // the context will be in a suspended state
    if (this.source && this.source.context.state === 'suspended') {
      await this.resumeContext()
    }
  }

  public play = async () => {
    const emitter = this.options.services.Emitter
  
    await this.beforePlay()
    await emitter.$emit(MediaSourceHookEnum.BEFORE_PLAY)
    await this.audio.play()
    await emitter.$emit(MediaSourceHookEnum.AFTER_PLAY)
  }

  public pause = async () => {
    const emitter = this.options.services.Emitter
  
    await emitter.$emit(MediaSourceHookEnum.BEFORE_PAUSE)
    await this.audio.pause()
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
      return this.audio.canPlayType(s.mediaType || '') !== ''
    })

    // Check that there is a playable streams
    if (!stream) {
      throw new NoPlayableSourceError(streams)
    }

    // Do not change audio stream if url has not changed
    if (this.audio.src !== stream.url) {
      // Set stream
      this.audio.src = stream.url

      // Attempt to create source
      this.tryCreateSource()
    }

    // Autoplay
    if (this.options.autoPlay) {
      await this.play()
    }
  }
}