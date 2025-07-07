import { useEffect, useRef } from 'react';

export default function VrPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderer: any, scene: any, camera: any;
    let controls: any;
    async function init() {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { VRButton } = await import('three/examples/jsm/webxr/VRButton.js');

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current! });
      renderer.setSize(600, 400);
      renderer.xr.enabled = true;
      document.body.appendChild(VRButton.createButton(renderer));

      controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 1.6, 3);

      try {
        const res = await fetch('http://localhost:3002/api/apps');
        const apps = await res.json();
        apps.forEach((a: any, i: number) => {
          const box = new THREE.BoxGeometry();
          const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const mesh = new THREE.Mesh(box, mat);
          mesh.position.set(i * 2, 1, -3);
          scene.add(mesh);
        });
      } catch (err) {
        console.error(err);
      }

      const step = 0.1;
      function onKey(e: KeyboardEvent) {
        if (e.key === 'w') camera.position.z -= step;
        if (e.key === 's') camera.position.z += step;
        if (e.key === 'a') camera.position.x -= step;
        if (e.key === 'd') camera.position.x += step;
      }
      window.addEventListener('keydown', onKey);

      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    }
    init();
    return () => {
      renderer?.setAnimationLoop(null);
    };
  }, []);

  return (
    <div>
      <h1>VR Preview</h1>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
