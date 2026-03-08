/// <reference types="vite/client" />

// AudioWorklet types (available in modern browsers but not in all TS lib configs)
declare class AudioWorkletProcessor {
  readonly port: MessagePort
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean
}

declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor
): void

interface AudioContext {
  readonly audioWorklet: AudioWorklet
}

interface AudioWorklet {
  addModule(moduleURL: string | URL): Promise<void>
}
