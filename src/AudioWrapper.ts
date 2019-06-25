import { MEDIA_EVENTS } from './constants'
import { IEmitter, MediaEvents, IAudioWrapper } from "./interfaces"

/**
 * A wrapper around HTMLAudioElement
 */
export class AudioWrapper implements IAudioWrapper {
  private _src = '' // For some reason pause does not work without this
  private isPlaying = false // Audio state
  private audio: HTMLAudioElement

  constructor (emitter?: IEmitter) {
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.audio.crossOrigin = "anonymous"

    this.attachHooks(emitter)
  }

  private attachHooks = (emitter?: IEmitter) => {
    const emit = (hookName: string, ...args: any[]) => {
      if (!emitter) {
        return
      }
      emitter.$emit(hookName, ...args)
    }

    this.audio.onplay = (...args) => {
      this.isPlaying = false
      emit(MediaEvents.PLAY, ...args)
    }

    this.audio.onplaying = (...args) => {
      this.isPlaying = true
      emit(MediaEvents.PLAYING, ...args)
    }

    this.audio.pause = (...args) => {
      this.isPlaying = false
      emit(MediaEvents.PAUSE, ...args)
    }

    // Emitter should response to all events
    for (const mediaEvent of MEDIA_EVENTS) {
      if (this.audio[`on${mediaEvent}`]) {
        return
      }

      this.audio[mediaEvent] = emit(mediaEvent)
    }
  }

  public get volume (): number {
    return this.audio.volume
  }

  public set volume (volume: number) {
    const normalizedVolume = Math.min(Math.max(volume, 0), 1)
    this.audio.volume = normalizedVolume
  }

  public getContextSource = (ctx: AudioContext): AudioNode => {
    return ctx.createMediaElementSource(this.audio)
  }

  public canPlayType = (type: string): CanPlayTypeResult => {
    return this.audio.canPlayType(type)
  }

  public get src (): string {
    return this._src
  }

  public set src (src: string) {
    this._src = src
    this.audio.src = src
  }

  public play = async () => {
    if (this.isPlaying) {
      await this.pause()
    }
    this.audio.src = this._src
    await this.audio.play()
  }

  public pause = async () => {
    this.audio.src = ''
    await this.audio.pause()
  }
}