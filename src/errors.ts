import { IStreamDefinition } from './interfaces'

export class ContextResumeError extends Error {
  constructor () {
    super('Unable to resume audio context. User interaction may be required by browser to initialize audio capabilities.')
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, ContextResumeError.prototype)
    }
  }
}

export class NoStreamsProvidedError extends Error {
  constructor () {
    super('No streams provided when invoking play action.')
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, NoStreamsProvidedError.prototype)
    }
  }
}

export class NoPlayableSourceError extends Error {
  constructor (streams: IStreamDefinition[]) {
    const streamTypes = streams.map((s) => s.type).join(', ')
    super(`
      Unable to play any of the provided stream types
      ${streamTypes}
    `)
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, NoPlayableSourceError.prototype)
    }
  }
}