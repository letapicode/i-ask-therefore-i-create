import { useEffect, useRef, useState } from 'react';

export default function ArPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/arLayout')
      .then((r) => r.json())
      .then((d) => setLayout(d.items || []));
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let renderer: any, scene: any, camera: any;
    async function init() {
      const THREE = await import('three');
      const { ARButton } = await import('three/examples/jsm/webxr/ARButton.js');
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(70, 600 / 400, 0.01, 20);
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,
      });
      renderer.setSize(600, 400);
      renderer.xr.enabled = true;
      document.body.appendChild(ARButton.createButton(renderer));

      layout.forEach((item) => {
        const box = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(box, mat);
        mesh.position.set(item.x, item.y, item.z);
        scene.add(mesh);
      });

      function onSelect() {
        const box = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(box, mat);
        mesh.position.set(0, 0, -0.5);
        scene.add(mesh);
        const newLayout = [...layout, { x: 0, y: 0, z: -0.5 }];
        setLayout(newLayout);
        fetch('/api/arLayout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newLayout }),
        }).catch(() => {});
      }

      const controller = renderer.xr.getController(0);
      controller.addEventListener('select', onSelect);
      scene.add(controller);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    }
    init();
    return () => {
      renderer?.setAnimationLoop(null);
    };
  }, [layout]);

  return (
    <div style={{ padding: 20 }}>
      <h1>AR Preview</h1>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
