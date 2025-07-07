import { useEffect, useRef } from 'react';

export default function VrPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.onload = () => {
      const THREE = (window as any).THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(600, 400);
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      camera.position.z = 5;
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <h1>VR Preview</h1>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
