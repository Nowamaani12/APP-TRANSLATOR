let audioContextInstance: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContextInstance || audioContextInstance.state === "closed") {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextInstance = new AudioContextClass();
  }
  if (audioContextInstance.state === "suspended") {
    audioContextInstance.resume();
  }
  return audioContextInstance;
}

export function stopCurrentAudio(): void {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {
      // Ignored if already stopped
    }
    currentSourceNode = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Decodes 16-bit Little-Endian mono PCM at 24000Hz from base64 and plays it through Web Audio API
 */
export async function playPcmFromBase64(
  base64Audio: string,
  sampleRate = 24000,
  onEnded?: () => void
): Promise<void> {
  stopCurrentAudio();

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit signed PCM samples
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);

  for (let i = 0; i < int16.length; i++) {
    // Normalize to [-1.0, 1.0]
    float32[i] = int16[i] / 32768;
  }

  const ctx = getAudioContext();
  const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
  audioBuffer.copyToChannel(float32, 0);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  currentSourceNode = source;

  source.onended = () => {
    if (currentSourceNode === source) {
      currentSourceNode = null;
    }
    if (onEnded) onEnded();
  };

  source.start(0);
}

/**
 * Fallback speech synthesis using native browser engine
 */
export function playBrowserSpeech(
  text: string,
  lang: "en" | "nyn" = "nyn",
  onEnded?: () => void
): boolean {
  if (!("speechSynthesis" in window)) return false;

  stopCurrentAudio();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88; // slightly slower for clearer Bantu phonetics
  utterance.pitch = 1.0;

  if (lang === "en") {
    utterance.lang = "en-UG"; // Ugandan English dialect if available
  } else {
    // Swahili / Bantu fallback for closer phonetic vowel values (a, e, i, o, u)
    utterance.lang = "sw";
  }

  utterance.onend = () => {
    if (onEnded) onEnded();
  };

  utterance.onerror = () => {
    if (onEnded) onEnded();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
