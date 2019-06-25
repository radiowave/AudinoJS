import { IStreamDefinition } from './interfaces'

export const getSortedStreams = (streams: IStreamDefinition[], priority: string[] = []) => {
  if (priority.length === 0) {
    return [...streams] // Return a new array
  }

  // Convert array to map
  const priorityMap: {[index: string]: number} = {}
  for (let i = 0; i < priority.length; i++) {
    const type = priority[i]
    priorityMap[type] = (i+1)
  }

  // Return a new sorted array of streams
  // Order of streams not defined in the priority
  // map is unchanged. Streams no defined in the priority
  // map will be pushed towards the end of the stream array.
  const sortedStreams = [...streams]
  return sortedStreams.sort((a, b) => {
    const aPriority = priorityMap[a.type] || (streams.length + 1)
    const bPriority = priorityMap[b.type] || (streams.length + 1)
  
    if (aPriority > bPriority) {
      return 1
    } else if (aPriority < bPriority) {
      return -1
    } else {
      return 0
    }
  })
}

export const attachMediaType = (stream: IStreamDefinition, typeMap: {[type: string]: string} = {}): IStreamDefinition => {
  return {
    ...stream,
    mediaType: stream.mediaType || typeMap[stream.type] || ''
  }
}
