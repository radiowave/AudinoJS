import * as sinon from 'sinon'
import { Audino } from '../src/player'
import * as factories from './factories'
import { IAudinoOptions, AudinoOptions, MediaSourceHookEnum } from '../src'
import { 
  ContextResumeError,
  NoPlayableSourceError,
  NoStreamsProvidedError
} from '../src/errors'

interface ITestOptions {
  autoPlay: boolean,
  resumeFail: boolean,
  failCreateSource: boolean
  contextState: AudioContextState
}

const getTestOptions = (): ITestOptions => {
  return {
    autoPlay: false, 
    resumeFail: false,
    contextState: 'running',
    failCreateSource: false
  }
}

const createTestEntities = (opts: Partial<ITestOptions> = {}) => {
  const testOptions: ITestOptions = {
    ...getTestOptions(),
    ...opts
  }

  const emitter = factories.makeEmitter()
  const ctxCtor = factories.makeAudioContextCTor()
  const { audioWrapperModule, ...spies } = factories.makeAudioWrapper(
    testOptions.contextState,
    testOptions.resumeFail,
    testOptions.failCreateSource
  )

  const options: IAudinoOptions = {
    autoPlay: testOptions.autoPlay,
    typeMap: {},
    modules: {
      createAudioWrapper: audioWrapperModule,
      createAudioContext: () => new ctxCtor()
    },
    services: {
      Emitter: emitter
    }
  }

  return {
    emitter,
    ...spies,
    audino: new Audino(options)
  }
}

describe('Player', () => {
  const sandbox = sinon.sandbox.create()

  beforeEach(() => {
    sandbox.stub(console, 'error')
    sandbox.stub(console, 'log')
    sandbox.stub(console, 'warn')
    sandbox.stub(console, 'info')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('Loading Streams', () => {
    it('should expect at least one stream', async () => {
      const { audino } = createTestEntities()

      await expect(audino.loadStream([])).rejects.toBeInstanceOf(NoStreamsProvidedError)
    })

    it('should not find a playable stream', async () => {
      const { audino } = createTestEntities()

      await expect(audino.loadStream([{
        url: 'http://url.com/stream.mp4',
        type: '',
        mediaType: ''
      }])).rejects.toBeInstanceOf(NoPlayableSourceError)
    })

    it('should find a playable stream', async () => {
      const { audino, playSpy } = createTestEntities()

      await expect(audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])).resolves.toBeUndefined()

      expect(audino.src).toEqual('http://url.com/stream.opus')
      expect(playSpy.called).toBeFalsy()
    })

    it('should accept a single stream', async () => {
      const { audino, playSpy } = createTestEntities()

      await expect(audino.loadStream({
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      })).resolves.toBeUndefined()

      expect(audino.src).toEqual('http://url.com/stream.opus')
      expect(playSpy.called).toBeFalsy()
    })

    it('should autoPlay', async () => {
      const { audino, playSpy } = createTestEntities({
        autoPlay: true
      })

      await expect(audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])).resolves.toBeUndefined()

      expect(audino.src).toEqual('http://url.com/stream.opus')
      expect(playSpy.called).toBeTruthy()
    })

    // Playing the same HTMLAudioElement does not create overlapping streams.
    // @TODO determine if test should be removed or criteria changed.
    it.skip('should not reload current streams', async () => {
      const { audino, playSpy } = createTestEntities({
        autoPlay: true
      })

      await expect(audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])).resolves.toBeUndefined()

      expect(audino.src).toEqual('http://url.com/stream.opus')
      expect(playSpy.called).toBeTruthy()

      await expect(audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])).resolves.toBeUndefined()

      expect(playSpy.calledOnce).toBeTruthy()
    })

    it('should fail to create a source', async () => {
      const { audino, connectSpy } = createTestEntities({
        contextState: 'suspended',
        failCreateSource: true
      })
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])
      
      expect(connectSpy.called).toBeFalsy()
    })

    it('should create a source', async () => {
      const { audino, connectSpy } = createTestEntities({
        contextState: 'suspended',
      })
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])
      
      expect(connectSpy.called).toBeTruthy()
    })

    it('should create a source once', async () => {
      const { audino, connectSpy } = createTestEntities({
        contextState: 'suspended',
      })
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await audino.loadStream([{
        url: 'http://url.com/stream.mp3',
        type: 'mp3',
        mediaType: 'mp3'
      }])
      
      expect(connectSpy.calledOnce).toBeTruthy()
    })
  })

  describe('Play', () => {
    it('should play', async () => {
      const { audino, playSpy, resumeSpy } = createTestEntities()
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await audino.play()
      
      expect(playSpy.called).toBeTruthy()
      expect(resumeSpy.called).toBeFalsy()
    })

    it('should resume context if needed', async () => {
      const { audino, playSpy, resumeSpy } = createTestEntities({
        contextState: 'suspended'
      })
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])
      await audino.play()
      
      expect(playSpy.called).toBeTruthy()
      expect(resumeSpy.called).toBeTruthy()
    })

    it('should fail resume', async () => {
      const { audino } = createTestEntities({
        resumeFail: true,
        contextState: 'suspended'
      })
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await expect(audino.play()).rejects.toBeInstanceOf(ContextResumeError)
    })

    it('should not resume before source creation', async () => {
      const { audino, playSpy, resumeSpy } = createTestEntities({
        contextState: 'suspended'
      })
      await audino.play()
      
      expect(playSpy.called).toBeTruthy()
      expect(resumeSpy.called).toBeFalsy()
    })
  })

  describe('Pause', () => {
    it('should pause', async () => {
      const { audino, pauseSpy } = createTestEntities()
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await audino.pause()
      
      expect(pauseSpy.called).toBeTruthy()
    })
  })

  describe('Volume', () => {
    it('should set the volume', () => {
      const { audino } = createTestEntities()
      expect(audino.volume).toEqual(1)
      audino.volume = 0.5
      expect(audino.volume).toEqual(0.5)
    })
  })

  describe('Options', () => {
    it('should provide default options', () => {
      const options = Audino.makePlayerOptions()
      expect(options).toBeInstanceOf(AudinoOptions)
    })
  })

  describe('Emitter', () => {
    it('should expose the emitter service', () => {
      const { audino, emitter } = createTestEntities()
      expect(audino.emitter).toBe(emitter)
    })

    it('should have play hooks', async () => {
      const { audino, emitter } = createTestEntities()
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await audino.play()
      expect(emitter.$emit.firstCall.args[0]).toEqual(MediaSourceHookEnum.BEFORE_PLAY)
      expect(emitter.$emit.secondCall.args[0]).toEqual(MediaSourceHookEnum.AFTER_PLAY)
    })

    it('should have pause hooks', async () => {
      const { audino, emitter } = createTestEntities()
      await audino.loadStream([{
        url: 'http://url.com/stream.opus',
        type: 'opus',
        mediaType: 'opus'
      }])

      await audino.pause()
      expect(emitter.$emit.firstCall.args[0]).toEqual(MediaSourceHookEnum.BEFORE_PAUSE)
      expect(emitter.$emit.secondCall.args[0]).toEqual(MediaSourceHookEnum.AFTER_PAUSE)
    })
  })
})