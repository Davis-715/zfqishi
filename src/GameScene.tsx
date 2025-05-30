import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// 定义星星粒子类型，扩展rotationSpeed属性
interface StarPoints extends THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> {
  rotationSpeed: number;
}

// 粒子配置类型
interface ParticleConfig {
  star: {
    count: number;
    size: number;
    rotationSpeed: number;
  };
  waterfall: {
    count: number;
    size: number;
    speed: number;
    spread: number;
  };
  fountain: {
    count: number;
    size: number;
    power: number;
    height: number;
  };
}

// 游戏场景组件
const GameScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleConfig, setParticleConfig] = useState<ParticleConfig>({
    star: { count: 2000, size: 0.5, rotationSpeed: 0.0002 },
    waterfall: { count: 1000, size: 1.5, speed: 0.2, spread: 10 },
    fountain: { count: 800, size: 1.8, power: 0.35, height: 15 },
  });
  
  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2a);
    scene.fog = new THREE.Fog(0x0a0a2a, 40, 100);
    
    // 初始化相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 40); 
    
    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加后期处理效果
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // 强度
      0.4, // 半径
      0.85 // 阈值
    );
    composer.addPass(bloomPass);
    
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 创建星空背景
    const createStars = () => {
      const { count, size, rotationSpeed } = particleConfig.star;
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: size,
        transparent: true,
        opacity: 0.8
      });
      
      const starsVertices = [];
      for (let i = 0; i < count; i++) {
        const x = THREE.MathUtils.randFloatSpread(200);
        const y = THREE.MathUtils.randFloatSpread(200);
        const z = THREE.MathUtils.randFloatSpread(200);
        starsVertices.push(x, y, z);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial) as StarPoints;
      stars.rotationSpeed = rotationSpeed;
      scene.add(stars);
      return stars;
    };
    
    // 创建粒子瀑布
    const createWaterfall = () => {
      const { count, size, speed, spread } = particleConfig.waterfall;
      const waterfallGeometry = new THREE.BufferGeometry();
      const waterfallMaterial = new THREE.PointsMaterial({
        color: 0x55aaff,
        size: size,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
      });
      
      const particles = new Float32Array(count * 3);
      const particleVelocities = new Float32Array(count);
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        particles[i3] = (Math.random() - 0.5) * spread; // x
        particles[i3 + 1] = Math.random() * 20; // y
        particles[i3 + 2] = (Math.random() - 0.5) * 5; // z
        
        particleVelocities[i] = Math.random() * speed + speed * 0.5;
      }
      
      waterfallGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
      const waterfall = new THREE.Points(waterfallGeometry, waterfallMaterial);
      waterfall.userData = { velocities: particleVelocities, resetY: 20 };
      scene.add(waterfall);
      return waterfall;
    };
    
    // 创建粒子喷泉
    const createFountain = () => {
      const { count, size, power, height } = particleConfig.fountain;
      const fountainGeometry = new THREE.BufferGeometry();
      const fountainMaterial = new THREE.PointsMaterial({
        color: 0xffaa55,
        size: size,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
      });
      
      const particles = new Float32Array(count * 3);
      const particleVelocities = new Float32Array(count * 3);
      const startPositions = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2;
        
        // 起始位置
        startPositions[i3] = Math.cos(angle) * radius;
        startPositions[i3 + 1] = 0;
        startPositions[i3 + 2] = Math.sin(angle) * radius;
        
        // 初始位置
        particles[i3] = startPositions[i3];
        particles[i3 + 1] = startPositions[i3 + 1];
        particles[i3 + 2] = startPositions[i3 + 2];
        
        // 初始速度
        const velocityPower = Math.random() * power + power * 0.3;
        particleVelocities[i3] = (Math.random() - 0.5) * 0.2;
        particleVelocities[i3 + 1] = Math.random() * velocityPower + velocityPower * 0.5;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      }
      
      fountainGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
      const fountain = new THREE.Points(fountainGeometry, fountainMaterial);
      fountain.userData = { 
        velocities: particleVelocities, 
        startPositions: startPositions,
        resetHeight: height
      };
      scene.add(fountain);
      return fountain;
    };
    
    //创建地面
    const createEnvironment = () => {
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a5c1a,
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      scene.add(ground);
      
      // 随机建筑
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a6d3b,
        roughness: 0.7,
        metalness: 0.3
      });
      
      for (let i = 0; i < 10; i++) {
        const size = Math.random() * 4 + 2;
        const height = Math.random() * 8 + 4;
        const buildingGeometry = new THREE.BoxGeometry(size, height, size);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        // 调整建筑位置范围以适应更大的地面
        building.position.x = (Math.random() - 0.5) * 80;
        building.position.z = (Math.random() - 0.5) * 80;
        building.position.y = height / 2 - 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        scene.add(building);
      }
      
      // 中央平台
      const platformGeometry = new THREE.CylinderGeometry(8, 8, 1, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x7d6608,
        roughness: 0.6,
        metalness: 0.4
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = -1.5;
      platform.receiveShadow = true;
      scene.add(platform);
    };
    
    // 创建场景元素
    const stars = createStars();
    const waterfall = createWaterfall();
    const fountain = createFountain();
    createEnvironment();
    
    // 添加控制球
    const controlBallGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const controlBallMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      emissive: 0xff0066,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7
    });
    const controlBall = new THREE.Mesh(controlBallGeometry, controlBallMaterial);
    controlBall.position.set(0, 0, 0);
    controlBall.castShadow = true;
    scene.add(controlBall);
    
    // 动画循环
    const clock = new THREE.Clock();
    let lastTime = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      const delta = time - lastTime;
      lastTime = time;
      
      // 旋转星空
      stars.rotation.y += stars.rotationSpeed;
      
      // 更新瀑布粒子
      const waterfallPositions = waterfall.geometry.attributes.position.array;
      const waterfallVelocities = waterfall.userData.velocities;
      
      for (let i = 0; i < waterfallPositions.length; i += 3) {
        const index = i / 3;
        waterfallPositions[i + 1] -= waterfallVelocities[index] * delta * 20;
        
        if (waterfallPositions[i + 1] < -10) {
          waterfallPositions[i + 1] = waterfall.userData.resetY;
          waterfallPositions[i] = (Math.random() - 0.5) * 10;
        }
      }
      
      waterfall.geometry.attributes.position.needsUpdate = true;
      
      // 更新喷泉粒子
      const fountainPositions = fountain.geometry.attributes.position.array;
      const fountainVelocities = fountain.userData.velocities;
      const startPositions = fountain.userData.startPositions;
      
      for (let i = 0; i < fountainPositions.length; i += 3) {
    
        // 应用重力
        fountainVelocities[i + 1] -= 0.2 * delta * 20;
    
        // 更新位置
        fountainPositions[i] += fountainVelocities[i] * delta * 10;
        fountainPositions[i + 1] += fountainVelocities[i + 1] * delta * 10;
        fountainPositions[i + 2] += fountainVelocities[i + 2] * delta * 10;
    
        // 重置粒子
        if (fountainPositions[i + 1] < 0) {
          fountainPositions[i] = startPositions[i];
          fountainPositions[i + 1] = startPositions[i + 1];
          fountainPositions[i + 2] = startPositions[i + 2];
        
          const velocityPower = Math.random() * particleConfig.fountain.power + particleConfig.fountain.power * 0.3;
          fountainVelocities[i] = (Math.random() - 0.5) * 0.2;
          fountainVelocities[i + 1] = Math.random() * velocityPower + velocityPower * 0.5;
          fountainVelocities[i + 2] = (Math.random() - 0.5) * 0.2;
        }
      }
      
      fountain.geometry.attributes.position.needsUpdate = true;
      
      // 控制球脉动效果
      const scale = 1 + Math.sin(time * 3) * 0.05;
      controlBall.scale.set(scale, scale, scale);
      
      controls.update();
      composer.render();
    };
    
    animate();
    
    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 键盘控制
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 0.2;
      switch (e.key) {
        case 'ArrowUp':
          controlBall.position.z -= speed;
          break;
        case 'ArrowDown':
          controlBall.position.z += speed;
          break;
        case 'ArrowLeft':
          controlBall.position.x -= speed;
          break;
        case 'ArrowRight':
          controlBall.position.x += speed;
          break;
        case ' ':
          controlBall.position.y += speed;
          break;
        case 'Shift':
          controlBall.position.y -= speed;
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.dispose();
    };
  }, [particleConfig]);
  
  // 更新粒子配置
  const updateConfig = (system: keyof ParticleConfig, key: string, value: number) => {
    setParticleConfig(prev => ({
      ...prev,
      [system]: {
        ...prev[system],
        [key]: value
      }
    }));
  };
  
  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />
      
      <div className="control-panel">
        <h2>粒子系统配置</h2>
        
        <div className="config-group">
          <h3>星空粒子</h3>
          <label>
            粒子数量: {particleConfig.star.count}
            <input 
              type="range" 
              min="500" max="5000" step="100" 
              value={particleConfig.star.count} 
              onChange={(e) => updateConfig('star', 'count', Number(e.target.value))}
            />
          </label>
          
          <label>
            旋转速度: {particleConfig.star.rotationSpeed.toFixed(5)}
            <input 
              type="range" 
              min="0.00001" max="0.001" step="0.00001" 
              value={particleConfig.star.rotationSpeed} 
              onChange={(e) => updateConfig('star', 'rotationSpeed', Number(e.target.value))}
            />
          </label>
        </div>
        
        <div className="config-group">
          <h3>粒子瀑布</h3>
          <label>
            粒子数量: {particleConfig.waterfall.count}
            <input 
              type="range" 
              min="100" max="3000" step="100" 
              value={particleConfig.waterfall.count} 
              onChange={(e) => updateConfig('waterfall', 'count', Number(e.target.value))}
            />
          </label>
          
          <label>
            下落速度: {particleConfig.waterfall.speed.toFixed(2)}
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05" 
              value={particleConfig.waterfall.speed} 
              onChange={(e) => updateConfig('waterfall', 'speed', Number(e.target.value))}
            />
          </label>
        </div>
        
        <div className="config-group">
          <h3>粒子喷泉</h3>
          <label>
            喷射力度: {particleConfig.fountain.power.toFixed(2)}
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05" 
              value={particleConfig.fountain.power} 
              onChange={(e) => updateConfig('fountain', 'power', Number(e.target.value))}
            />
          </label>
          
          <label>
            粒子大小: {particleConfig.fountain.size.toFixed(1)}
            <input 
              type="range" 
              min="0.5" max="5.0" step="0.1" 
              value={particleConfig.fountain.size} 
              onChange={(e) => updateConfig('fountain', 'size', Number(e.target.value))}
            />
          </label>
        </div>
        
        <div className="instructions">
          <h3>控制说明</h3>
          <p>鼠标: 旋转视角</p>
          <p>滚轮: 缩放视角</p>
          <p>方向键: 移动控制球</p>
          <p>空格: 向上移动</p>
          <p>Shift: 向下移动</p>
        </div>
      </div>
      
      <div className="title">
        <h1>欢迎来到张飞骑士</h1>
        <p>由于在雷雨天气打游戏被雷劈中，你进入了游戏并化身为张飞人...</p>
      </div>
    </div>
  );
};

// 样式
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Pixelify Sans', sans-serif;
  }
  
  body {
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #e6e6ff;
  }
  
  .game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
  }
  
  .game-canvas {
    position: absolute;
    top: 0;
    left: 0;
    outline: none;
  }
  
  .control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(10, 15, 35, 0.7);
    border: 2px solid #55aaff;
    border-radius: 10px;
    padding: 15px;
    width: 300px;
    backdrop-filter: blur(5px);
    z-index: 10;
  }
  
  .config-group {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #55aaff;
  }
  
  h2, h3 {
    color: #ffaa55;
    margin-bottom: 10px;
    text-shadow: 0 0 5px rgba(255, 170, 85, 0.5);
  }
  
  label {
    display: block;
    margin: 10px 0;
    font-size: 14px;
  }
  
  input[type="range"] {
    width: 100%;
    margin-top: 5px;
    accent-color: #55aaff;
  }
  
  .instructions {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ffaa55;
  }
  
  .instructions p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    text-align: left;
    background: rgba(10, 15, 35, 0.7);
    border: 2px solid #ffaa55;
    border-radius: 10px;
    padding: 15px;
    backdrop-filter: blur(5px);
    z-index: 10;
  }
  
  .title h1 {
    color: #ffaa55;
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .title p {
    color: #55aaff;
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    .control-panel {
      width: 250px;
      top: 10px;
      right: 10px;
    }
    
    .title {
      top: 10px;
      left: 10px;
      width: calc(100% - 270px);
    }
  }
`;

// 添加样式到文档
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default GameScene;