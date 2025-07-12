import { useEffect, useRef, useState } from 'react';

interface PeerInfo {
  pc: RTCPeerConnection;
  channel?: RTCDataChannel;
}

export default function ArPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<any[]>([]);
  const wsRef = useRef<WebSocket>();
  const peersRef = useRef<Record<string, PeerInfo>>({});
  const idRef = useRef<string>('' + Math.random().toString(36).slice(2));

  useEffect(() => {
    fetch('/api/arLayout')
      .then((r) => r.json())
      .then((d) => setLayout(d.items || []));

    const ws = new WebSocket('ws://localhost:3002/arSignal?session=default');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', id: idRef.current }));
    };
    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'join' && msg.id !== idRef.current) {
        connectPeer(msg.id, true);
      } else if (msg.type === 'offer' && msg.to === idRef.current) {
        const peer = connectPeer(msg.from, false);
        await peer.pc.setRemoteDescription(msg.sdp);
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        ws.send(
          JSON.stringify({
            type: 'answer',
            from: idRef.current,
            to: msg.from,
            sdp: peer.pc.localDescription,
          })
        );
      } else if (msg.type === 'answer' && msg.to === idRef.current) {
        const peer = peersRef.current[msg.from];
        if (peer) await peer.pc.setRemoteDescription(msg.sdp);
      } else if (msg.type === 'candidate' && msg.to === idRef.current) {
        const peer = peersRef.current[msg.from];
        if (peer) await peer.pc.addIceCandidate(msg.candidate);
      }
    };
    return () => ws.close();
  }, []);

  const connectPeer = (peerId: string, initiator: boolean): PeerInfo => {
    let peer = peersRef.current[peerId];
    if (peer) return peer;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const info: PeerInfo = { pc };
    peersRef.current[peerId] = info;
    if (initiator) {
      info.channel = pc.createDataChannel('layout');
      setupChannel(info.channel);
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(
          JSON.stringify({
            type: 'offer',
            from: idRef.current,
            to: peerId,
            sdp: pc.localDescription,
          })
        );
      };
    } else {
      pc.ondatachannel = (ev) => {
        info.channel = ev.channel;
        setupChannel(info.channel);
      };
    }
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        wsRef.current?.send(
          JSON.stringify({
            type: 'candidate',
            from: idRef.current,
            to: peerId,
            candidate: ev.candidate,
          })
        );
      }
    };
    return info;
  };

  const setupChannel = (channel: RTCDataChannel) => {
    channel.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'layout') {
        setLayout(msg.layout);
      }
    };
  };

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
        Object.values(peersRef.current).forEach((p) => {
          p.channel?.send(
            JSON.stringify({ type: 'layout', layout: newLayout })
          );
        });
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
      Object.values(peersRef.current).forEach((p) => p.pc.close());
      wsRef.current?.close();
    };
  }, [layout]);

  return (
    <div style={{ padding: 20 }}>
      <h1>AR Preview</h1>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
