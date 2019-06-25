import { Emitter } from './emitter'
import { TYPE_MAP } from './constants'
import { AudioWrapper } from './AudioWrapper'
import { IAudinoOptions, IEmitter } from './interfaces'
import { WebApi } from './webApi'

export class AudinoOptions implements IAudinoOptions {
  public autoPlay = true
  public typeMap = { 
    ...TYPE_MAP 
  }
  public modules = {
    createAudioWrapper: (emitter?: IEmitter) => {
      return new AudioWrapper(emitter)
    },
    createAudioContext: () => {
      return new WebApi.AudioContext()
    }
  }
  public services = {
    Emitter: new Emitter()
  }
}
