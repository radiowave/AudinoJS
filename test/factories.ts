import * as sinon from 'sinon'
import { IAudioWrapper } from '../src'

export const makeEmitter = () => {
  return {
    $offAll: sinon.spy(),
    $emit: sinon.spy(),
    $on: sinon.spy(),
  }
}

export const makeAudioWrapper = (
  state: AudioContextState = 'running',
  failResume = false,
  failCreateSource = false
) => {
  const resumeSpy = sinon.stub().callsFake(() => {
    if (failResume) {
      throw new Error()
    }
  })
  const playSpy = sinon.spy()
  const pauseSpy = sinon.spy()
  const connectSpy = sinon.spy()
  const disconnectSpy = sinon.spy()

  const audioWrapper: IAudioWrapper = {
    src: '',
    volume: 1,
    play: playSpy,
    pause: pauseSpy,
    canPlayType: (str) => str ? 'probably' : '',
    getAudioNode: () => {
      if (failCreateSource) {
        throw new Error()
      }

      // @ts-ignore
      const node = {
        connect: connectSpy,
        disconnect: disconnectSpy,
        context: {
          resume: resumeSpy,
          state,
        }
      } as AudioNode
      return  node
    }
  }

  return {
    playSpy,
    pauseSpy,
    resumeSpy,
    connectSpy,
    disconnectSpy,
    audioWrapperModule: () => audioWrapper
  }
}

export const makeAudioContext = () => {
  const ctx = {
    destination: null
  } as AudioContext
  return ctx
}

export const makeAudioContextCTor = (): { new (): AudioContext } => {
  // @ts-ignore
  return class TextContext {}
}