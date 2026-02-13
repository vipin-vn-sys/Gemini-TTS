
/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 encoded string.
 * @returns The decoded byte array.
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a WAV file Blob from raw PCM audio data.
 * The browser's <audio> element cannot play raw PCM, so it needs a container format.
 * @param pcmData The raw PCM audio data as a Uint8Array.
 * @returns A Blob representing the WAV file.
 */
export function createWavBlob(pcmData: Uint8Array): Blob {
    const sampleRate = 24000; // Gemini TTS model output sample rate
    const numChannels = 1;     // Mono audio
    const bitsPerSample = 16;  // 16-bit PCM

    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const wavHeaderSize = 44;
    const dataSize = pcmData.byteLength;
    const totalFileSize = wavHeaderSize + dataSize;

    const buffer = new ArrayBuffer(totalFileSize);
    const view = new DataView(buffer);

    // Helper to write a string to the DataView
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, totalFileSize - 8, true); // ChunkSize
    writeString(8, 'WAVE');

    // "fmt " sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);                // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);                 // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);       // NumChannels
    view.setUint32(24, sampleRate, true);        // SampleRate
    view.setUint32(28, byteRate, true);          // ByteRate
    view.setUint16(32, blockAlign, true);        // BlockAlign
    view.setUint16(34, bitsPerSample, true);     // BitsPerSample

    // "data" sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); // Subchunk2Size

    // Write PCM data
    for (let i = 0; i < dataSize; i++) {
        view.setUint8(wavHeaderSize + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
}
