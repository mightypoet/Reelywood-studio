
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeDCardProps {
  name: string;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({ name }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef(name);
  const cardRef = useRef<THREE.Mesh>(null);
  const textTextureRef = useRef<THREE.CanvasTexture>(null);

  useEffect(() => {
    nameRef.current = name;
    if (textTextureRef.current) {
      updateTexture(name);
    }
  }, [name]);

  const updateTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background base
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Top Header Section
    // Logo Text (R)
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'black 120px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('R', canvas.width / 2, 180);

    // Reelywood Logo Text
    ctx.fillStyle = 'white';
    ctx.font = 'black 32px Plus Jakarta Sans';
    ctx.letterSpacing = '8px';
    ctx.fillText('REELYWOOD STUDIO', canvas.width / 2, 260);
    
    // Role Title
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 18px Plus Jakarta Sans';
    ctx.letterSpacing = '4px';
    ctx.fillText('CREATOR ELITE TRANSIT', canvas.width / 2, 300);

    // Center Name Section
    ctx.fillStyle = 'white';
    const displayName = text.toUpperCase() || 'YOUR NAME';
    
    // Dynamic sizing for long names
    let fontSize = 80;
    if (displayName.length > 12) fontSize = 60;
    if (displayName.length > 20) fontSize = 40;
    
    ctx.font = `black ${fontSize}px Plus Jakarta Sans`;
    ctx.letterSpacing = '1px';
    ctx.textAlign = 'center';
    
    // Draw name centered vertically
    ctx.fillText(displayName, canvas.width / 2, 600);

    // Bottom Footer Details
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 14px Plus Jakarta Sans';
    ctx.letterSpacing = '3px';
    ctx.fillText('AUTHENTICATED ACCESS V.4.0', canvas.width / 2, 920);
    ctx.fillText('ID: RW-' + Math.floor(10000 + Math.random() * 90000), canvas.width / 2, 950);

    if (textTextureRef.current) {
      textTextureRef.current.image = canvas;
      textTextureRef.current.needsUpdate = true;
    } else {
      textTextureRef.current = new THREE.CanvasTexture(canvas);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 4.5; // Adjusted distance for vertical card aspect

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4F46E5, 30);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const topLight = new THREE.PointLight(0xffffff, 50);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    // Card Geometry - Now Vertical (Width: 2.0, Height: 3.2)
    const geometry = new THREE.BoxGeometry(2.0, 3.2, 0.05);
    updateTexture(nameRef.current);
    
    const material = new THREE.MeshPhysicalMaterial({
      map: textTextureRef.current,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1,
      emissive: new THREE.Color(0x000000),
    });

    const card = new THREE.Mesh(geometry, material);
    cardRef.current = card;
    scene.add(card);

    // Mouse Tracking
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth follow
      target.x += (mouse.x - target.x) * 0.1;
      target.y += (mouse.y - target.y) * 0.1;

      if (cardRef.current) {
        cardRef.current.rotation.y = target.x * 0.4 + Math.sin(Date.now() * 0.001) * 0.05;
        cardRef.current.rotation.x = -target.y * 0.3;
        
        topLight.position.x = target.x * 5;
        topLight.position.y = target.y * 5;
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
