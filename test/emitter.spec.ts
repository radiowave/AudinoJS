import { Emitter } from '../src/emitter'
import { IEmitter } from '../src';

const emitToPromise = (emitter: IEmitter, hookName: string) => {
  return new Promise((resolve) => {
    emitter.$on(hookName, () => resolve())
  })
}

describe('Emitter', () => {
  describe('Single Hook', () => {
    it('should emit and hook', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('test', () => {
        done()
      })
  
      emitter.$emit('test')
    })
    it('should emit and not hook', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('test', () => {
        done(1)
      })
  
      emitter.$emit('somethingElse')
        .then(() => done())
    })
    it('should emit wildcard', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('*', () => {
        done()
      })
  
      emitter.$emit('test')
    })
    it('should emit parameters', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('test', (...args) => {
        expect(args).toEqual([1,2,3])
        done()
      })
  
      emitter.$emit('test', 1, 2, 3)
    })
    it('should off', (done) => {
      const emitter = new Emitter()
  
      const $off = emitter.$on('test', () => {
        done(1)
      })
      $off()
  
      emitter.$emit('test')
        .then(() => done())
    })
    it('can off after off all', (done) => {
      const emitter = new Emitter()
  
      const $off = emitter.$on('test', () => {
        done(1)
      })
      emitter.$offAll('test')
      $off()
  
      emitter.$emit('test')
        .then(() => done())
    })
    it('should handle callback errors', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('test', () => {
        throw new Error()
      })
  
      emitter.$emit('test')
        .then(() => done())
    })
  })

  describe('Multi Hook', () => {
    it('should emit', (done) => {
      const emitter = new Emitter()
  
      const promise1 = emitToPromise(emitter, 'test')
      const promise2 = emitToPromise(emitter, 'test')

      Promise.all([promise1, promise2])
        .then(() => done())
  
      emitter.$emit('test')
    })
    it('should off all', (done) => {
      const emitter = new Emitter()
  
      emitter.$on('test', () => {
        done(1)
      })
      emitter.$on('test', () => {
        done(1)
      })
      emitter.$offAll('test')
  
      emitter.$emit('test')
        .then(() => done())
    })
    it('should off one', (done) => {
      const emitter = new Emitter()
  
      const $off = emitter.$on('test', () => {
        done(1)
      })
      emitter.$on('test', () => {
        done()
      })
      $off()
  
      emitter.$emit('test')
    })
  })
})