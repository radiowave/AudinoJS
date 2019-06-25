

## Description

Audino.js is a audio library built for native OPUS, MP3, OGA, and AAC streaming. It relies on the [Web Audio API](https://webaudio.github.io/web-audio-api/) to reliably stream audio across all platforms. This library was developed for the [Radiowave.io](https://radiowave.io) platform.  

[![Build Status](https://travis-ci.org/radiowave/radiowave-player.svg?branch=master)](https://travis-ci.org/radiowave/radiowave-player)
[![Coverage Status](https://coveralls.io/repos/github/radiowave/radiowave-player/badge.svg?branch=master)](https://coveralls.io/github/radiowave/radiowave-player?branch=master)

## Features

- Cross platform support
- Supports OPUS, OGA, MP3, AAC
- No outside dependencies needed
- Small in size (6kb)

## Installation

```
npm install @radiowave/audino --save
```

## Example Usage

```js
import { Audino } from '@radiowave/audino'

const play = async () => {
  const player = new Audino()
  await player.loadStream({
    url: 'http://url.com/stream.mp3',
    type: 'mp3'
  })
  await player.play()
}

(async () => {
  await play()
})()
```

## Interfaces

#### IAudino

| Property    | Type                                                                                   | Description                                                                               | Is Read Only |
|-------------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|--------------|
| volume      | Number                                                                                 | The current audio volume. Float from 0.0 to 1.0.                                          | false        |
| src         | String                                                                                 | The current audio source.                                                                 | true         |
| emitter     | IEmitter                                                                               | The event emitter service.                                                                | true         |
| play        | () => Promise<void>                                                                    | Begin playback.                                                                           |              |
| pause       | () => Promise<void>                                                                    | Pause playback.                                                                           |              |
| loadStreams | (streams: IStreamDefinition|IStreamDefinition[], priority?: string[]) => Promise<void> | Load streams. Streams will be sorted by type corresponding to order in priority provided. |              |

#### IStreamDefinition

| Property  | Type    | Description                                         | Is Read Only |
|-----------|---------|-----------------------------------------------------|--------------|
| url       | String  | The url of the stream to load.                      | false        |
| type      | String  | The format of stream. (mp3, aac, oga, opus, ...etc) | false        |
| mediaType | ?String | The full type including codec where applicable.     | false        |

#### IEmitter 

| Property | Type                                                   | Description                                                                                             |
|----------|--------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| $on      | (hookName: string, fn: (...args) => any) => () => void | Subscribe the provided callback function (fn) to the specified hook. Returns a function to unsubscribe. |
| $emit    | (hookName: string, ...args) => Promise<void>           | Emit an event to all callback functions for the specified hook.                                         |
| $offAll  | (hookName: string) => void                             | Remove all subscriptions for the specified hook.                                                        |
