import { attachGestures } from './index';

function createEvent(type: string, props: Record<string, any>) {
  const ev = new Event(type);
  Object.assign(ev, props);
  return ev as any;
}

test('drag handler receives delta', () => {
  const el: any = new EventTarget();
  let dx = 0;
  const dispose = attachGestures(el, { onDrag: (d) => { dx = d; } });
  el.dispatchEvent(createEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
  el.dispatchEvent(createEvent('pointermove', { pointerId: 1, clientX: 2, clientY: 0 }));
  expect(dx).toBe(2);
  dispose();
});

test('scale handler triggered', () => {
  const el: any = new EventTarget();
  let called = false;
  const dispose = attachGestures(el, { onScale: () => { called = true; } }, { scaleSensitivity: 1 });
  el.dispatchEvent(createEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
  el.dispatchEvent(createEvent('pointerdown', { pointerId: 2, clientX: 0, clientY: 10 }));
  el.dispatchEvent(createEvent('pointermove', { pointerId: 2, clientX: 0, clientY: 20 }));
  el.dispatchEvent(createEvent('pointermove', { pointerId: 2, clientX: 0, clientY: 30 }));
  expect(called).toBe(true);
  dispose();
});
