const PROCESSOR_NAME = 'pcm16-processor'

class Pcm16Processor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]
    if (!input || input.length === 0) return true

    const channelData = input[0]
    if (!channelData || channelData.length === 0) return true

    const pcm16 = new Int16Array(channelData.length)
    for (let i = 0; i < channelData.length; i++) {
      const sample = channelData[i]
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    }

    this.port.postMessage(pcm16.buffer, [pcm16.buffer])
    return true
  }
}

registerProcessor(PROCESSOR_NAME, Pcm16Processor)
