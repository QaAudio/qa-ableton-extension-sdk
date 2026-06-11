/** Peak extraction utilities for waveform rendering. */

function chunkId(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(
    bytes[offset] ?? 0,
    bytes[offset + 1] ?? 0,
    bytes[offset + 2] ?? 0,
    bytes[offset + 3] ?? 0,
  );
}

/**
 * Parses a WAV blob and returns bucketed peak values in [0, 1].
 *
 * Reads the first channel only and supports 8/16/24/32-bit PCM and 32-bit float.
 *
 * @example
 * const peaks = decodeWavPeaks(wavBytes, 200);
 */
export function decodeWavPeaks(bytes: Uint8Array, buckets = 200): number[] {
  if (bytes.length < 44 || chunkId(bytes, 0) !== "RIFF" || chunkId(bytes, 8) !== "WAVE") {
    return [];
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let audioFormat = 1;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataLength = 0;

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const id = chunkId(bytes, offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === "fmt ") {
      audioFormat = view.getUint16(body, true);
      numChannels = view.getUint16(body + 2, true) || 1;
      bitsPerSample = view.getUint16(body + 14, true) || 16;
    } else if (id === "data") {
      dataOffset = body;
      dataLength = size;
    }
    offset = body + size + (size % 2);
  }

  if (dataOffset < 0) return [];

  const bytesPerSample = bitsPerSample >> 3;
  const frameSize = bytesPerSample * numChannels;
  if (frameSize <= 0) return [];

  const end = Math.min(dataOffset + dataLength, bytes.length);
  const frameCount = Math.floor((end - dataOffset) / frameSize);
  if (frameCount <= 0) return [];

  const readSample = (frameIndex: number): number => {
    const pos = dataOffset + frameIndex * frameSize;
    if (audioFormat === 3 && bitsPerSample === 32) return view.getFloat32(pos, true);
    switch (bitsPerSample) {
      case 8:
        return (view.getUint8(pos) - 128) / 128;
      case 16:
        return view.getInt16(pos, true) / 32768;
      case 24: {
        const raw =
          view.getUint8(pos) |
          (view.getUint8(pos + 1) << 8) |
          (view.getUint8(pos + 2) << 16);
        const signed = raw & 0x800000 ? raw | ~0xffffff : raw;
        return signed / 8388608;
      }
      case 32:
        return view.getInt32(pos, true) / 2147483648;
      default:
        return 0;
    }
  };

  return bucketPeaks(frameCount, buckets, (frame) => Math.abs(readSample(frame)));
}

/**
 * Extracts bucketed peak amplitudes from an `AudioBuffer`.
 *
 * @example
 * const peaks = peaksFromAudioBuffer(buffer, 200);
 */
export function peaksFromAudioBuffer(buffer: AudioBuffer, buckets = 200): number[] {
  const frameCount = buffer.length;
  if (frameCount <= 0) return [];

  const channelData = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index),
  );

  return bucketPeaks(frameCount, buckets, (frame) => {
    let max = 0;
    for (const channel of channelData) {
      const value = Math.abs(channel[frame] ?? 0);
      if (value > max) max = value;
    }
    return max;
  });
}

function bucketPeaks(
  frameCount: number,
  buckets: number,
  readAbs: (frame: number) => number,
): number[] {
  const peaks: number[] = new Array(buckets).fill(0);
  const perBucket = frameCount / buckets;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const start = Math.floor(bucket * perBucket);
    const stop = Math.min(frameCount, Math.floor((bucket + 1) * perBucket));
    let max = 0;
    for (let frame = start; frame < stop; frame++) {
      const value = readAbs(frame);
      if (value > max) max = value;
    }
    peaks[bucket] = Math.min(1, max);
  }
  return peaks;
}

function hashSeed(seed: string | number): number {
  const text = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates deterministic pseudo-random peaks for demos and screenshots.
 *
 * @example
 * const peaks = fakePeaks("sample-editor", 400);
 */
export function fakePeaks(seed: string | number, buckets = 200): number[] {
  const rand = mulberry32(hashSeed(seed));
  const peaks: number[] = [];
  let envelope = 0.3 + rand() * 0.5;

  for (let i = 0; i < buckets; i++) {
    envelope = envelope * 0.92 + rand() * 0.08;
    const spike = rand() ** 0.4;
    peaks.push(Math.min(1, envelope * (0.25 + spike * 0.75)));
  }

  return peaks;
}
