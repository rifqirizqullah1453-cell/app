// Sound alert system using HTML5 Audio
const AUDIO_URLS: Record<string, string> = {
  new_order: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // short notification ding
  message: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // subtle pop
  completed: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // success chime
  emergency: 'https://assets.mixkit.co/active_storage/sfx/2861/2861-preview.mp3', // alarm-like
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

export function playSound(type: keyof typeof AUDIO_URLS = 'new_order', volume = 0.6) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const audio = new Audio(AUDIO_URLS[type]);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // Audio blocked or not supported
  }
}

export function vibrate(pattern: number | number[] = 200) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
}

export function useSoundAlert() {
  const alertNewOrder = () => { playSound('new_order'); vibrate([100, 50, 100]); };
  const alertMessage = () => { playSound('message'); vibrate(50); };
  const alertCompleted = () => { playSound('completed'); vibrate([100, 50, 200]); };
  const alertEmergency = () => { playSound('emergency'); vibrate([300, 100, 300, 100, 500]); };

  return { alertNewOrder, alertMessage, alertCompleted, alertEmergency, playSound };
}
