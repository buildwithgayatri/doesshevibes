export type NavPattern = 'continue' | 'turn_left' | 'turn_right' | 'destination' | 'alert' | 'slight_left' | 'slight_right' | 'uturn';

const patterns: Record<NavPattern, number[]> = {
  continue: [200],
  turn_left: [200, 100, 200],
  turn_right: [200, 100, 200, 100, 200],
  destination: [800],
  alert: [500, 200, 500],
  slight_left: [150, 80, 150],
  slight_right: [150, 80, 150, 80, 150],
  uturn: [300, 100, 300, 100, 300],
};

export function vibrate(pattern: NavPattern): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[pattern]);
  } else {
    triggerVisualVibration(patterns[pattern]);
  }
}

function triggerVisualVibration(pattern: number[]): void {
  const el = document.getElementById('visual-vibration-indicator');
  if (!el) return;
  let i = 0;
  const run = () => {
    if (i >= pattern.length) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      i++;
      if (i < pattern.length) {
        setTimeout(run, pattern[i] || 100);
      } else {
        el.style.display = 'none';
      }
    }, pattern[i] || 100);
  };
  run();
}

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

const defaultMessages: Record<NavPattern, string> = {
  continue: 'Continue straight',
  turn_left: 'Turn left',
  turn_right: 'Turn right',
  destination: 'You have arrived at your destination',
  alert: 'Alert',
  slight_left: 'Keep slightly left',
  slight_right: 'Keep slightly right',
  uturn: 'Make a U-turn',
};

const freqMap: Record<NavPattern, number> = {
  continue: 600,
  turn_left: 400,
  turn_right: 500,
  destination: 800,
  alert: 300,
  slight_left: 550,
  slight_right: 580,
  uturn: 350,
};

export function playSound(pattern: NavPattern, customMessage?: string): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freqMap[pattern];
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // audio not available
  }

  speak(customMessage || defaultMessages[pattern]);
}

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.volume = 0.9;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch {
    // speech not available
  }
}

export function giveFeedback(
  pattern: NavPattern,
  vibrationEnabled: boolean,
  soundEnabled: boolean,
  customMessage?: string
): void {
  if (vibrationEnabled) vibrate(pattern);
  if (soundEnabled) playSound(pattern, customMessage);
}

// Detect turn direction between two consecutive path segments
export function detectTurn(
  prev: { lat: number; lng: number },
  curr: { lat: number; lng: number },
  next: { lat: number; lng: number }
): { pattern: NavPattern; instruction: string } {
  const d1Lat = curr.lat - prev.lat;
  const d1Lng = curr.lng - prev.lng;
  const d2Lat = next.lat - curr.lat;
  const d2Lng = next.lng - curr.lng;

  // Cross product to determine left vs right
  // Positive cross = turning right, negative = turning left
  const cross = d1Lat * d2Lng - d1Lng * d2Lat;

  // Dot product to determine if it's a sharp turn or slight
  const dot = d1Lat * d2Lat + d1Lng * d2Lng;
  const mag1 = Math.sqrt(d1Lat * d1Lat + d1Lng * d1Lng);
  const mag2 = Math.sqrt(d2Lat * d2Lat + d2Lng * d2Lng);
  const cosAngle = mag1 > 0 && mag2 > 0 ? dot / (mag1 * mag2) : 1;
  const angle = Math.acos(Math.min(1, Math.max(-1, cosAngle))) * (180 / Math.PI);

  // If angle is very small, it's basically straight
  if (angle < 15) {
    return { pattern: 'continue', instruction: 'Continue straight' };
  }

  // U-turn detection (angle > 150)
  if (angle > 150) {
    return { pattern: 'uturn', instruction: 'Make a U-turn' };
  }

  const isSlight = angle < 45;

  if (cross > 0) {
    // Right turn (in lat/lng coordinate space)
    if (isSlight) {
      return { pattern: 'slight_right', instruction: 'Keep slightly right' };
    }
    return { pattern: 'turn_right', instruction: 'Turn right' };
  } else {
    if (isSlight) {
      return { pattern: 'slight_left', instruction: 'Keep slightly left' };
    }
    return { pattern: 'turn_left', instruction: 'Turn left' };
  }
}

// Generate turn-by-turn navigation instructions for an entire route
export function generateNavInstructions(
  path: { lat: number; lng: number }[],
  segmentNames: string[]
): { pattern: NavPattern; instruction: string; segmentIndex: number }[] {
  const instructions: { pattern: NavPattern; instruction: string; segmentIndex: number }[] = [];

  if (path.length < 2) return instructions;

  // Start instruction
  instructions.push({
    pattern: 'continue',
    instruction: 'Starting navigation. Follow the route.',
    segmentIndex: 0,
  });

  for (let i = 1; i < path.length - 1; i++) {
    const turn = detectTurn(path[i - 1], path[i], path[i + 1]);
    const segIdx = Math.min(
      Math.floor((i / (path.length - 1)) * segmentNames.length),
      segmentNames.length - 1
    );
    const segName = segmentNames[segIdx] || 'the road';

    let instruction: string;
    if (turn.pattern === 'continue') {
      instruction = `Continue straight on ${segName}`;
    } else {
      instruction = `${turn.instruction} onto ${segName}`;
    }

    instructions.push({
      pattern: turn.pattern,
      instruction,
      segmentIndex: segIdx,
    });
  }

  // Destination instruction
  instructions.push({
    pattern: 'destination',
    instruction: 'You have arrived at your destination.',
    segmentIndex: segmentNames.length - 1,
  });

  return instructions;
}
