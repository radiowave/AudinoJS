/**
 * TYPES
 */

export type AudioContextModule = () => AudioContext
export type AudioWrapperModule = (emitter?: IEmitter) => IAudioWrapper

/**
 * INTERFACES
 */

export interface IEmitter {
  $offAll: (hookName: string) => void
  $emit: (hookName: string, ...args: any[]) => Promise<void>
  $on: (hookName: string, fn: (...args) => any) => () => void
}

export interface IStreamDefinition {
  url: string
  type: string
  mediaType?: string
}

export interface IAudino {
  volume: number
  readonly src: string
  readonly emitter: IEmitter
  play: () => Promise<void>
  pause: () => Promise<void>
  loadStream: (
    streams: IStreamDefinition|IStreamDefinition[],
    priority?: string[]
  ) => Promise<void>
}

export interface IAudinoOptions {
  autoPlay: Boolean,
  services: {
    Emitter: IEmitter
  },
  modules: {
    createAudioContext: AudioContextModule
    createAudioWrapper: AudioWrapperModule
  },
  typeMap: {
    [type: string]: string
  }
}

export interface IAudioWrapper {
  src: string
  volume: number
  play: () => Promise<void>
  pause: () => Promise<void>
  canPlayType: (type: string) => CanPlayTypeResult
  getContextSource: (ctx: AudioContext) => AudioNode
}

/**
 * ENUMERATIONS
 */

export enum MediaSourceHookEnum {
  BEFORE_PLAY = 'beforePlay',
  BEFORE_PAUSE = 'beforePause',
  AFTER_PLAY = 'afterPlay',
  AFTER_PAUSE = 'afterPause',
  LOAD_ERROR = 'loadError'
}

export enum MediaEvents {
  PLAYING = 'playing',
  WAITING = 'waiting',
  SEEKING = 'seeking',
  SEEKED = 'seeked',
  ENDED = 'ended',
  LOADED_META_DATA = 'loadedmetadata',
  LOADED_DATA = 'loadeddata',
  CAN_PLAY = 'canplay',
  CAN_PLAY_THROUGH = 'canplaythrough',
  DURATION_CHANGE = 'durationchange',
  TIME_UPDATE = 'timeupdate',
  PLAY = 'play',
  PAUSE = 'pause',
  RATE_CHANGE = 'ratechange',
  VOLUME_CHANGE = 'volumechange',
  SUSPEND = 'suspend',
  EMPTIED = 'emptied',
  STALLED = 'stalled'
}
