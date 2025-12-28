
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface ThreeDCardProps {
  name: string;
  handle: string;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({ name, handle }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef(name);
  const handleRef = useRef(handle);
  const cardRef = useRef<THREE.Mesh>(null);
  const textTextureRef = useRef<THREE.CanvasTexture>(null);

  useEffect(() => {
    nameRef.current = name;
    handleRef.current = handle;
    if (textTextureRef.current) {
      updateTexture(name, handle);
    }
  }, [name, handle]);

  const updateTexture = (text: string, userHandle: string) => {
    const canvas = document.createElement('canvas');
    // Vertical aspect: 1024x1600 (Portrait)
    canvas.width = 1024;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Base Glass Frost
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Iridescent Glow Edge
    const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    borderGrad.addColorStop(0, '#ff7eb3');
    borderGrad.addColorStop(0.3, '#ff758c');
    borderGrad.addColorStop(0.5, '#70d6ff');
    borderGrad.addColorStop(0.8, '#9ef01a');
    borderGrad.addColorStop(1, '#ff00ff');
    
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
    ctx.globalAlpha = 1.0;

    // 3. Subtle Texture Noise (Glass Grain)
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    const displayName = text || 'Rohan Das';
    const displayHandle = userHandle ? (userHandle.startsWith('@') ? userHandle : '@' + userHandle) : '@the_mighty_poet';

    // 4. Header: REELYWOOD
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '500 84px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '14px';
    ctx.fillText('REELYWOOD', 100, 240);
    
    // 5. Bottom: Name & Handle
    ctx.letterSpacing = '1px';
    ctx.font = '500 88px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.fillText(displayName, 100, canvas.height - 380);
    ctx.shadowBlur = 0;

    ctx.font = '300 52px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(displayHandle, 100, canvas.height - 280);

    if (textTextureRef.current) {
      textTextureRef.current.image = canvas;
      textTextureRef.current.needsUpdate = true;
    } else {
      textTextureRef.current = new THREE.CanvasTexture(canvas);
      textTextureRef.current.anisotropy = 16;
      textTextureRef.current.colorSpace = THREE.SRGBColorSpace;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 50);
    mainLight.position.set(5, 5, 8);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2);
    rimLight.position.set(-5, 5, 5);
    scene.add(rimLight);

    // Vertical Card Geometry (Portrait)
    const w = 2.4, h = 3.8, r = 0.22;
    const shape = new THREE.Shape();
    shape.moveTo(-w/2 + r, -h/2);
    shape.lineTo(w/2 - r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    shape.lineTo(w/2, h/2 - r);
    shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    shape.lineTo(-w/2 + r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    shape.lineTo(-w/2, -h/2 + r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 32,
      steps: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    updateTexture(nameRef.current, handleRef.current);

    const material = new THREE.MeshPhysicalMaterial({
      map: textTextureRef.current,
      transparent: true,
      opacity: 0.45,
      transmission: 0.98,
      roughness: 0.08,
      metalness: 0,
      ior: 1.55,
      thickness: 0.4,
      specularIntensity: 2.5,
      envMapIntensity: 2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      iridescence: 0.3,
      iridescenceIOR: 1.4,
    });

    const card = new THREE.Mesh(geometry, material);
    cardRef.current = card;
    scene.add(card);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', onPointerMove as any);

    function onPointerMove(e: PointerEvent) {
       const rect = mountRef.current?.getBoundingClientRect();
       if (!rect) return;
       mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
       mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    const animate = () => {
      if (mountRef.current && !mountRef.current.contains(renderer.domElement)) return;
      requestAnimationFrame(animate);

      target.x += (mouse.x - target.x) * 0.12;
      target.y += (mouse.y - target.y) * 0.12;

      if (cardRef.current) {
        cardRef.current.rotation.y = (target.x * 0.45) + Math.sin(Date.now() * 0.0004) * 0.04;
        cardRef.current.rotation.x = (-target.y * 0.35) + Math.cos(Date.now() * 0.0003) * 0.04;
        
        mainLight.position.x = 5 + target.x * 4;
        mainLight.position.y = 5 + target.y * 4;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onPointerMove as any);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
