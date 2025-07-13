# AR Gestures

Reusable gesture helpers for AR layout editing.

## Usage

```ts
import { attachGestures } from 'ar-gestures';

const dispose = attachGestures(canvas, {
  onDrag: (dx, dy) => moveSelected(dx, dy),
  onRotate: (angle) => rotateSelected(angle),
  onScale: (delta) => scaleSelected(delta)
}, { rotateSensitivity: 1, scaleSensitivity: 0.02 });
```

Call the returned `dispose()` function to remove listeners when cleaning up.

## Extension Points

- Configure sensitivities via `GestureOptions`.
- Provide custom handlers for drag, rotate and scale events.
- Extend this package to add new gesture types if needed.
