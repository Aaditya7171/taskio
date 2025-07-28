import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import * as THREE from 'three';

interface CustomRobotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CustomRobot: React.FC<CustomRobotProps> = ({
  className = '',
  size = 'lg'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const robotRef = useRef<THREE.Group>();
  const headRef = useRef<THREE.Group>();
  const leftPupilRef = useRef<THREE.Mesh>();
  const rightPupilRef = useRef<THREE.Mesh>();
  const bodyRef = useRef<THREE.Mesh>();
  const mouthRef = useRef<THREE.Mesh>();
  const animationIdRef = useRef<number>();

  const targetHeadRotation = useRef({ x: 0, y: 0 });
  const targetPupilOffset = useRef({ x: 0, y: 0 });
  const lastMouseMove = useRef(Date.now());
  const lastMessageTime = useRef(Date.now());
  const currentMessage = useRef('');
  const messageTimeout = useRef<NodeJS.Timeout>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80'
  };

  // Get user info for personalized messages
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'there';

  // Cute personalized messages from Tasky
  const robotMessages = [
    { text: `👋 Hey ${userName}, I'm Tasky!`, emoji: "👋", duration: 4000 },
    { text: `✨ ${userName}, you're doing amazing!`, emoji: "✨", duration: 3500 },
    { text: `🤗 Hi ${userName}! Ready to be productive?`, emoji: "🤗", duration: 3800 },
    { text: `💖 ${userName}, I believe in you!`, emoji: "💖", duration: 3200 },
    { text: `🌟 Hey ${userName}, let's make today great!`, emoji: "🌟", duration: 4000 },
    { text: `🎯 ${userName}, focus on what matters!`, emoji: "🎯", duration: 3500 },
    { text: `☀️ Good vibes, ${userName}!`, emoji: "☀️", duration: 3000 },
    { text: `🚀 ${userName}, you're unstoppable!`, emoji: "🚀", duration: 3200 },
    { text: `💪 Keep going, ${userName}!`, emoji: "💪", duration: 3000 },
    { text: `🎉 Celebrate your wins, ${userName}!`, emoji: "🎉", duration: 3500 },
    { text: `📝 Time to organize, ${userName}!`, emoji: "📝", duration: 3200 },
    { text: `☕ Take a break, ${userName}!`, emoji: "☕", duration: 3000 },
    { text: `🌈 Stay positive, ${userName}!`, emoji: "🌈", duration: 3200 },
    { text: `⭐ You're a star, ${userName}!`, emoji: "⭐", duration: 3000 },
    { text: `🤖 I'm here to help, ${userName}!`, emoji: "🤖", duration: 3500 }
  ];

  // Cute theme-based color palette that adapts to light/dark mode
  const colors = {
    // Head: Soft pastel colors that change with theme
    headTop: isDark ? 0xFCE7F3 : 0xFDF2F8,    // Soft pink
    headBottom: isDark ? 0xE0E7FF : 0xEDE9FE,  // Light lavender

    // Body: Warm, friendly colors
    bodyTop: isDark ? 0xDDD6FE : 0xF3E8FF,     // Light purple
    bodyBottom: isDark ? 0xFECDD3 : 0xFCE7F3,  // Soft rose

    // Lighting colors (theme-adaptive)
    keyLight: isDark ? 0xF8BBD9 : 0xFCE7F3,    // Soft pink light
    fillLight1: isDark ? 0xC7D2FE : 0xE0E7FF,  // Soft blue
    fillLight2: isDark ? 0xFECDD3 : 0xFDF2F8,  // Rose light

    // Eye elements (cute and expressive)
    eyeSclera: 0xFFFFFF,                       // Pure white
    pupil: isDark ? 0x1E293B : 0x0F172A,      // Dark but soft
    eyeGlow: isDark ? 0xC084FC : 0x8B5CF6,    // Purple glow

    // Mouth: Cute coral that adapts to theme
    mouth: isDark ? 0xFF8FA3 : 0xF472B6,      // Coral pink

    // Cheek blush for cuteness
    blush: isDark ? 0xFDA4AF : 0xFB7185,      // Soft blush

    // Environment (theme-adaptive)
    background: isDark ? 0x0F0F23 : 0xFFFBFF,
    floor: isDark ? 0x1E1B4B : 0xF8FAFC
  };

  // Function to show random messages
  const showRandomMessage = () => {
    const randomMessage = robotMessages[Math.floor(Math.random() * robotMessages.length)];
    setDisplayMessage(randomMessage.text);
    currentMessage.current = randomMessage.text;

    // Clear previous timeout
    if (messageTimeout.current) {
      clearTimeout(messageTimeout.current);
    }

    // Hide message after duration
    messageTimeout.current = setTimeout(() => {
      setDisplayMessage('');
      currentMessage.current = '';
    }, randomMessage.duration);

    lastMessageTime.current = Date.now();
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with pastel backdrop
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.background);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 6);

    // Renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add gradient floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: colors.floor,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    // Professional lighting setup
    // Low-level ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Soft pink key light
    const keyLight = new THREE.DirectionalLight(colors.keyLight, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Mint fill light
    const fillLight1 = new THREE.PointLight(colors.fillLight1, 0.8, 100);
    fillLight1.position.set(-8, 3, 8);
    scene.add(fillLight1);

    // Lavender fill light
    const fillLight2 = new THREE.PointLight(colors.fillLight2, 0.6, 100);
    fillLight2.position.set(8, -2, 6);
    scene.add(fillLight2);

    // Rim light for glow effect
    const rimLight = new THREE.PointLight(0xffffff, 0.4, 50);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);

    // Create robot group
    const robot = new THREE.Group();
    robotRef.current = robot;
    scene.add(robot);

    // Create head group for pivoting
    const headGroup = new THREE.Group();
    headRef.current = headGroup;
    robot.add(headGroup);

    // Simplified materials using standard Three.js materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: colors.bodyTop,
      roughness: 0.3,
      metalness: 0.2
    });

    const headMaterial = new THREE.MeshStandardMaterial({
      color: colors.headTop,
      roughness: 0.2,
      metalness: 0.1
    });

    // Pupil material
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: colors.pupil,
      roughness: 0.1,
      metalness: 0.0
    });

    // Mouth material
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: colors.mouth,
      emissive: colors.mouth,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.0
    });

    // Robot Body - Bottom sphere
    const bodyGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    bodyRef.current = body;
    robot.add(body);

    // Robot Head - Top sphere
    const headGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);

    // EVA-style Eyes Design

    // Eye glow rings (subtle outer glow like EVA)
    const eyeGlowGeometry = new THREE.CircleGeometry(0.18, 32);
    const eyeGlowMaterial = new THREE.MeshStandardMaterial({
      color: colors.eyeGlow,
      emissive: colors.eyeGlow,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.3,
      roughness: 0.0,
      metalness: 0.0
    });

    const leftEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
    leftEyeGlow.position.set(-0.35, 1.9, 0.94);
    headGroup.add(leftEyeGlow);

    const rightEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
    rightEyeGlow.position.set(0.35, 1.9, 0.94);
    headGroup.add(rightEyeGlow);

    // Eye Sclera - Pure white like EVA
    const scleraGeometry = new THREE.CircleGeometry(0.15, 32);
    const scleraMaterial = new THREE.MeshStandardMaterial({
      color: colors.eyeSclera,
      emissive: colors.eyeSclera,
      emissiveIntensity: 0.05,
      roughness: 0.0,
      metalness: 0.0
    });

    const leftSclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
    leftSclera.position.set(-0.35, 1.9, 0.95);
    headGroup.add(leftSclera);

    const rightSclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
    rightSclera.position.set(0.35, 1.9, 0.95);
    headGroup.add(rightSclera);

    // Pupils - EVA-style deep blue-black
    const pupilGeometry = new THREE.CircleGeometry(0.06, 32);
    const evaPupilMaterial = new THREE.MeshStandardMaterial({
      color: colors.pupil,
      emissive: colors.pupil,
      emissiveIntensity: 0.1,
      roughness: 0.1,
      metalness: 0.0
    });

    const leftPupil = new THREE.Mesh(pupilGeometry, evaPupilMaterial);
    leftPupil.position.set(-0.35, 1.9, 0.96); // Slightly forward
    leftPupilRef.current = leftPupil;
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, evaPupilMaterial);
    rightPupil.position.set(0.35, 1.9, 0.96); // Slightly forward
    rightPupilRef.current = rightPupil;
    headGroup.add(rightPupil);

    // Cute mouth (smaller and more adorable)
    const mouthGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.65, 0.9);
    mouth.scale.set(1.2, 0.4, 0.4);
    mouthRef.current = mouth;
    headGroup.add(mouth);

    // Cute cheek blush for adorable factor
    const blushMaterial = new THREE.MeshStandardMaterial({
      color: colors.blush,
      emissive: colors.blush,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.6,
      roughness: 0.8,
      metalness: 0.0
    });

    const blushGeometry = new THREE.SphereGeometry(0.08, 16, 16);

    const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial);
    leftBlush.position.set(-0.6, 1.7, 0.85);
    leftBlush.scale.set(0.8, 0.6, 0.3);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial);
    rightBlush.position.set(0.6, 1.7, 0.85);
    rightBlush.scale.set(0.8, 0.6, 0.3);
    headGroup.add(rightBlush);



    // Position robot properly
    robot.position.y = 0;

    // Enhanced mouse tracking with expanded area
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;

      // Get mouse position relative to the entire viewport for expanded tracking
      const rect = mountRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Expand tracking area beyond the robot container
      const trackingRadius = Math.max(window.innerWidth, window.innerHeight) * 0.6;
      const x = (event.clientX - centerX) / trackingRadius;
      const y = (event.clientY - centerY) / trackingRadius;

      // Clamp values to reasonable range
      const clampedX = Math.max(-1, Math.min(1, x));
      const clampedY = Math.max(-1, Math.min(1, y));

      // Update target positions - Head follows cursor naturally
      targetHeadRotation.current.y = clampedX * 0.5; // Increased range for better tracking
      targetHeadRotation.current.x = clampedY * 0.4; // Increased range for better tracking

      // Pupil offset within eye disc constraints (larger range for flat discs)
      targetPupilOffset.current.x = Math.max(-0.08, Math.min(0.08, clampedX * 0.06));
      targetPupilOffset.current.y = Math.max(-0.08, Math.min(0.08, clampedY * 0.06));

      lastMouseMove.current = Date.now();
    };

    // Add global mouse tracking for expanded area
    document.addEventListener('mousemove', handleMouseMove);

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    setIsLoaded(true);

    // Animation loop with proper physics and idle behavior
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const isIdle = Date.now() - lastMouseMove.current > 3000; // 3 seconds idle

      if (robot && headRef.current && leftPupilRef.current && rightPupilRef.current) {

        // Idle behavior - vertical bob and gentle sway
        if (isIdle) {
          robot.position.y = Math.sin(time * 0.8) * 0.15;
          robot.rotation.z = Math.sin(time * 0.6) * 0.02;

          // Idle head movement
          targetHeadRotation.current.y = Math.sin(time * 0.3) * 0.1;
          targetHeadRotation.current.x = Math.sin(time * 0.4) * 0.05;

          // Idle eye movement
          targetPupilOffset.current.x = Math.sin(time * 0.7) * 0.02;
          targetPupilOffset.current.y = Math.sin(time * 0.5) * 0.015;
        }

        // Smooth head rotation with lerp
        headRef.current.rotation.y += (targetHeadRotation.current.y - headRef.current.rotation.y) * 0.08;
        headRef.current.rotation.x += (targetHeadRotation.current.x - headRef.current.rotation.x) * 0.08;

        // Pupil tracking with constraints
        const leftPupilTargetX = -0.35 + targetPupilOffset.current.x;
        const leftPupilTargetY = 1.9 + targetPupilOffset.current.y;
        const rightPupilTargetX = 0.35 + targetPupilOffset.current.x;
        const rightPupilTargetY = 1.9 + targetPupilOffset.current.y;

        leftPupilRef.current.position.x += (leftPupilTargetX - leftPupilRef.current.position.x) * 0.12;
        leftPupilRef.current.position.y += (leftPupilTargetY - leftPupilRef.current.position.y) * 0.12;

        rightPupilRef.current.position.x += (rightPupilTargetX - rightPupilRef.current.position.x) * 0.12;
        rightPupilRef.current.position.y += (rightPupilTargetY - rightPupilRef.current.position.y) * 0.12;

        // Keep eyes always open - no blinking
        leftPupilRef.current.scale.y = 1;
        rightPupilRef.current.scale.y = 1;

        // Pulsating glow on mouth
        if (mouthRef.current && mouthRef.current.material) {
          const material = mouthRef.current.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
        }

        // Random message system
        const timeSinceLastMessage = Date.now() - lastMessageTime.current;
        const shouldShowMessage = timeSinceLastMessage > 8000 + Math.random() * 12000; // 8-20 seconds

        if (shouldShowMessage && !currentMessage.current) {
          showRandomMessage();
        }
      }

      renderer.render(scene, camera);
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

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [colors, isDark]);

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <motion.div
        ref={mountRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        style={{
          filter: `drop-shadow(0 0 20px ${isDark ? 'rgba(177, 156, 217, 0.3)' : 'rgba(139, 92, 246, 0.3)'})`
        }}
      />

      {/* Robot Message Display */}
      {displayMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-700 text-sm font-medium text-purple-600 dark:text-purple-400 whitespace-nowrap">
            {displayMessage}
            {/* Speech bubble arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </motion.div>
      )}

      {/* Floating particles around robot */}
      <motion.div
        className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
        animate={{
          y: [0, 10, 0],
          x: [0, -5, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-1/2 -left-3 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
        animate={{
          x: [0, -8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
};

export default CustomRobot;
