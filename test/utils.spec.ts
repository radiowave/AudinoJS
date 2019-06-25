import * as Faker from 'faker'
import * as utils from '../src/utils'
import { IStreamDefinition } from '../src';

describe('Utils', () => {
  describe('getSortedStreams', () => {
    const streams: IStreamDefinition[] = [
      { url: Faker.internet.url(), type: 'opus' },
      { url: Faker.internet.url(), type: 'mp3' },
      { url: Faker.internet.url(), type: 'oga' },
      { url: Faker.internet.url(), type: 'wav' }
    ]

    it('return a new array for noop', () => {
      const outputStreams = utils.getSortedStreams(streams)

      expect(outputStreams).not.toBe(streams)
    })
    it('should sort streams by priority', () => {
      const types = ['oga', 'mp3', 'wav', 'opus']
      const outputStreams = utils.getSortedStreams(streams, types)

      expect(outputStreams).not.toBe(streams)
      for (let i = 0; i < types.length; i++) {
        expect(outputStreams[i].type).toEqual(types[i])
      }
    })
    it('relative position of unspecified types should be unaltered', () => {
      const types = ['wav', 'opus']
      const outputStreams = utils.getSortedStreams(streams, types)

      expect(outputStreams).not.toBe(streams)
      for (let i = 0; i < types.length; i++) {
        expect(outputStreams[i].type).toEqual(types[i])
      }

      // These two streams get pushed to bottom
      // But their order does not change
      expect(outputStreams[2].type).toEqual('mp3') // 1 -> 2
      expect(outputStreams[3].type).toEqual('oga') // 2 -> 3
    })
  })

  describe('attachMediaType', () => {
    const typeMap = {
      opus: 'audio/ogg; codecs=opus'
    }

    it('should return a new stream object', () => {
      const stream: IStreamDefinition = {
        url: Faker.internet.url(),
        type: 'opus'
      }

      const outputStream = utils.attachMediaType(stream, typeMap)
      expect(outputStream).not.toBe(stream)
    })
    it('should default to stream media type', () => {
      const stream: IStreamDefinition = {
        url: Faker.internet.url(),
        type: 'opus',
        mediaType: 'default-media-type'
      }

      const outputStream = utils.attachMediaType(stream, typeMap)
      expect(outputStream).toEqual(expect.objectContaining(stream))
      expect(outputStream.mediaType).toEqual('default-media-type')
    })
    it('should fill media types from map', () => {
      const stream: IStreamDefinition = {
        url: Faker.internet.url(),
        type: 'opus'
      }

      const outputStream = utils.attachMediaType(stream, typeMap)
      expect(outputStream).toEqual(expect.objectContaining(stream))
      expect(outputStream.mediaType).toEqual(typeMap.opus)
    })
    it('should default to empty media type', () => {
      const stream: IStreamDefinition = {
        url: Faker.internet.url(),
        type: 'unknown'
      }

      const outputStream = utils.attachMediaType(stream, typeMap)
      expect(outputStream).toEqual(expect.objectContaining(stream))
      expect(outputStream.mediaType).toEqual('')
    })
  })
})