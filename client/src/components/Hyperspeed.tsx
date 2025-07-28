import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { HyperspeedOptions } from '@/types';

interface HyperspeedProps {
  effectOptions?: Partial<HyperspeedOptions>;
}

const defaultOptions: HyperspeedOptions = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xFFFFFF,
    brokenLines: 0xFFFFFF,
    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
    sticks: 0x03B3C3,
  }
};

const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions = {} }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();

  const options = { ...defaultOptions, ...effectOptions };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.colors?.background || 0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      options.fov || 90,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create road geometry
    const roadGeometry = new THREE.PlaneGeometry(options.roadWidth || 10, options.length || 400);
    const roadMaterial = new THREE.MeshBasicMaterial({ 
      color: options.colors?.roadColor || 0x080808 
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Create island (center divider)
    const islandGeometry = new THREE.PlaneGeometry(options.islandWidth || 2, options.length || 400);
    const islandMaterial = new THREE.MeshBasicMaterial({ 
      color: options.colors?.islandColor || 0x0a0a0a 
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.rotation.x = -Math.PI / 2;
    island.position.y = 0.01;
    scene.add(island);

    // Create lane lines
    const createLaneLines = () => {
      const lineGeometry = new THREE.PlaneGeometry(0.1, options.length || 400);
      const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: options.colors?.brokenLines || 0xFFFFFF 
      });

      // Left side lines
      for (let i = 1; i < (options.lanesPerRoad || 4); i++) {
        const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
        leftLine.rotation.x = -Math.PI / 2;
        leftLine.position.x = -((options.roadWidth || 10) / 2) + (i * (options.roadWidth || 10) / (options.lanesPerRoad || 4) / 2);
        leftLine.position.y = 0.02;
        scene.add(leftLine);
      }

      // Right side lines
      for (let i = 1; i < (options.lanesPerRoad || 4); i++) {
        const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
        rightLine.rotation.x = -Math.PI / 2;
        rightLine.position.x = ((options.roadWidth || 10) / 2) - (i * (options.roadWidth || 10) / (options.lanesPerRoad || 4) / 2);
        rightLine.position.y = 0.02;
        scene.add(rightLine);
      }
    };

    createLaneLines();

    // Create light sticks
    const createLightSticks = () => {
      const stickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5);
      const stickMaterial = new THREE.MeshBasicMaterial({ 
        color: options.colors?.sticks || 0x03B3C3 
      });

      for (let i = 0; i < (options.totalSideLightSticks || 20); i++) {
        // Left side sticks
        const leftStick = new THREE.Mesh(stickGeometry, stickMaterial);
        leftStick.position.x = -((options.roadWidth || 10) / 2 + 2);
        leftStick.position.y = 0.75;
        leftStick.position.z = (i - (options.totalSideLightSticks || 20) / 2) * 20;
        scene.add(leftStick);

        // Right side sticks
        const rightStick = new THREE.Mesh(stickGeometry, stickMaterial);
        rightStick.position.x = (options.roadWidth || 10) / 2 + 2;
        rightStick.position.y = 0.75;
        rightStick.position.z = (i - (options.totalSideLightSticks || 20) / 2) * 20;
        scene.add(rightStick);
      }
    };

    createLightSticks();

    // Create car lights
    const createCarLights = () => {
      const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      
      // Left cars (red lights)
      const leftLightMaterial = new THREE.MeshBasicMaterial({ 
        color: options.colors?.leftCars?.[0] || 0xD856BF 
      });
      
      // Right cars (blue lights)
      const rightLightMaterial = new THREE.MeshBasicMaterial({ 
        color: options.colors?.rightCars?.[0] || 0x03B3C3 
      });

      for (let i = 0; i < (options.lightPairsPerRoadWay || 40); i++) {
        // Left side car lights
        const leftLight = new THREE.Mesh(lightGeometry, leftLightMaterial);
        leftLight.position.x = -((options.roadWidth || 10) / 4);
        leftLight.position.y = 0.2;
        leftLight.position.z = (i - (options.lightPairsPerRoadWay || 40) / 2) * 10;
        scene.add(leftLight);

        // Right side car lights
        const rightLight = new THREE.Mesh(lightGeometry, rightLightMaterial);
        rightLight.position.x = (options.roadWidth || 10) / 4;
        rightLight.position.y = 0.2;
        rightLight.position.z = (i - (options.lightPairsPerRoadWay || 40) / 2) * 10;
        scene.add(rightLight);
      }
    };

    createCarLights();

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;

      // Move camera forward to create motion effect
      camera.position.z = Math.sin(time * 0.5) * 2;

      // Animate car lights
      scene.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          child.position.z += (index % 2 === 0) ? 0.5 : -0.5;
          
          // Reset position when lights go too far
          if (child.position.z > 200) child.position.z = -200;
          if (child.position.z < -200) child.position.z = 200;
        }
      });

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [options]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ 
        background: `#${options.colors?.background?.toString(16).padStart(6, '0') || '000000'}` 
      }}
    />
  );
};

export default Hyperspeed;
