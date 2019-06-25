export const TYPE_MAP = {
  aac: 'audio/aac',
  mp3: 'audio/mp3',
  opus: 'audio/ogg; codecs=opus',
  oga: 'audio/ogg; codecs=vorbis'
}

export const MEDIA_EVENTS = [
  'playing',
  'waiting',
  'seeking',
  'seeked',
  'ended',
  'loadedmetadata',
  'loadeddata',
  'canplay',
  'canplaythrough',
  'durationchange',
  'timeupdate',
  'play',
  'pause',
  'ratechange',
  'volumechange',
  'suspend',
  'emptied',
  'stalled'
]