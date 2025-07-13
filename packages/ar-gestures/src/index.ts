export interface GestureOptions {
  rotateSensitivity?: number;
  scaleSensitivity?: number;
}

export interface GestureHandlers {
  onDrag?: (dx: number, dy: number) => void;
  onRotate?: (deltaRad: number) => void;
  onScale?: (delta: number) => void;
}

export function attachGestures(
  element: EventTarget,
  handlers: GestureHandlers,
  options: GestureOptions = {},
  globalTarget: EventTarget = typeof window === 'undefined' ? element : window
): () => void {
  const { rotateSensitivity = 1, scaleSensitivity = 0.01 } = options;
  const active = new Map<number, { x: number; y: number }>();
  let lastDistance = 0;
  let lastAngle = 0;

  function pointerDown(e: PointerEvent) {
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function pointerMove(e: PointerEvent) {
    const prev = active.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (active.size === 1) {
      handlers.onDrag?.(dx, dy);
    } else if (active.size === 2) {
      const pts = Array.from(active.values());
      const [p1, p2] = pts;
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      if (lastDistance !== 0) {
        handlers.onScale?.((dist - lastDistance) * scaleSensitivity);
      }
      if (lastAngle !== 0) {
        handlers.onRotate?.((angle - lastAngle) * rotateSensitivity);
      }
      lastDistance = dist;
      lastAngle = angle;
    }
  }

  function pointerUp(e: PointerEvent) {
    active.delete(e.pointerId);
    if (active.size < 2) {
      lastDistance = 0;
      lastAngle = 0;
    }
  }

  element.addEventListener('pointerdown', pointerDown);
  element.addEventListener('pointermove', pointerMove);
  globalTarget.addEventListener('pointerup', pointerUp);
  return () => {
    element.removeEventListener('pointerdown', pointerDown);
    element.removeEventListener('pointermove', pointerMove);
    globalTarget.removeEventListener('pointerup', pointerUp);
  };
}
