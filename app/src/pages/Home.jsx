import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import * as THREE from 'three';

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.9, 12);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(2, 2);
    let hoveredMesh = null;

    const ambient = new THREE.AmbientLight('#f7e6ff', 0.45);
    scene.add(ambient);

    const hemisphere = new THREE.HemisphereLight('#ffffff', '#2a143f', 0.85);
    scene.add(hemisphere);

    const sunLight = new THREE.DirectionalLight('#ffffff', 1.05);
    sunLight.position.set(6, 8, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight('#cfe7ff', 0.55);
    fillLight.position.set(-6, 4, 6);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 1024;
    fillLight.shadow.mapSize.height = 1024;
    fillLight.shadow.camera.near = 1;
    fillLight.shadow.camera.far = 30;
    fillLight.shadow.camera.left = -12;
    fillLight.shadow.camera.right = 12;
    fillLight.shadow.camera.top = 12;
    fillLight.shadow.camera.bottom = -12;
    fillLight.visible = false;
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#ffffff', 0.35);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    const pillarSize = { width: 1.6, height: 4, depth: 1.6 };
    const baseSize = { radius: 1.3, height: 0.5 };
    const pillarGeometry = new THREE.BoxGeometry(
      pillarSize.width,
      pillarSize.height,
      pillarSize.depth
    );
    const createPillarGradientTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      const gradient = context.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#c5e0cd');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
      return texture;
    };

    const pillarGradientMap = createPillarGradientTexture();
    const pillarSideMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: pillarGradientMap,
      roughness: 0.2,
      metalness: 0.7,
      emissive: '#274036',
      emissiveIntensity: 0.12,
    });
    const pillarTopMaterial = new THREE.MeshStandardMaterial({
      color: '#d9efe1',
      roughness: 0.22,
      metalness: 0.7,
      emissive: '#2b3d34',
      emissiveIntensity: 0.08,
    });
    const pillarBottomMaterial = new THREE.MeshStandardMaterial({
      color: '#0d0b12',
      roughness: 0.35,
      metalness: 0.5,
    });
    const pillarMaterial = [
      pillarSideMaterial,
      pillarSideMaterial,
      pillarTopMaterial,
      pillarBottomMaterial,
      pillarSideMaterial,
      pillarSideMaterial,
    ];
    const rowGroups = [];
    const rowMeshes = [];
    const rowHeightStep = 0.17;

    const baseGeometry = new THREE.CylinderGeometry(
      baseSize.radius,
      baseSize.radius,
      baseSize.height,
      48,
      1
    );
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: '#2a143f',
      roughness: 0.8,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.receiveShadow = true;
    base.position.y = -2.5;
    scene.add(base);

    const floorGeometry = new THREE.CircleGeometry(6, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#1b0b2b',
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.75;
    scene.add(floor);

    let animationFrame = 0;
    const hoverLift = 1.1;

    const getPlaneIntersectionX = (ndcX, planeZ) => {
      const ndcPoint = new THREE.Vector3(ndcX, 0, 0.5).unproject(camera);
      const dir = ndcPoint.sub(camera.position).normalize();
      if (Math.abs(dir.z) < 1e-6) {
        return 0;
      }
      const t = (planeZ - camera.position.z) / dir.z;
      return camera.position.x + dir.x * t;
    };

    const layoutPillarsToScreenWidth = () => {
      const planeZ = 0;
      const leftEdge = getPlaneIntersectionX(-1, planeZ);
      const rightEdge = getPlaneIntersectionX(1, planeZ);
      const padding = 10;
      const minX = Math.min(leftEdge, rightEdge) - padding;
      const maxX = Math.max(leftEdge, rightEdge) + padding;
      const startX = Math.floor(minX / pillarSize.width) * pillarSize.width;
      const endX = Math.ceil(maxX / pillarSize.width) * pillarSize.width;
      const baseCount =
        Math.round((endX - startX) / pillarSize.width) + 1;
      const rowSpacing = pillarSize.depth;

      const rowCounts = [];
      let count = baseCount;
      while (count > 0) {
        rowCounts.push(count);
        count -= 2;
      }

      while (rowGroups.length < rowCounts.length) {
        const group = new THREE.Group();
        scene.add(group);
        rowGroups.push(group);
        rowMeshes.push([]);
      }
      while (rowGroups.length > rowCounts.length) {
        const group = rowGroups.pop();
        const meshes = rowMeshes.pop();
        for (const mesh of meshes) {
          group.remove(mesh);
        }
        scene.remove(group);
      }

      for (let rowIndex = 0; rowIndex < rowCounts.length; rowIndex += 1) {
        const columns = rowCounts[rowIndex];
        const visibleIndices = [];
        for (let i = 0; i < columns; i += 1) {
          if (i === 0 || i === columns - 1 || i % 2 === 0) {
            visibleIndices.push(i);
          }
        }
        const needed = visibleIndices.length;
        const group = rowGroups[rowIndex];
        const meshes = rowMeshes[rowIndex];

        while (meshes.length < needed) {
          const mesh = new THREE.Mesh(pillarGeometry, pillarMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData.bobOffset = Math.random() * Math.PI * 2;
          group.add(mesh);
          meshes.push(mesh);
        }
        while (meshes.length > needed) {
          const mesh = meshes.pop();
          group.remove(mesh);
        }

        const rowStartX = startX + rowIndex * pillarSize.width;
        const rowScale = 1 + rowIndex * rowHeightStep;
        for (let i = 0; i < meshes.length; i += 1) {
          const mesh = meshes[i];
          const columnIndex = visibleIndices[i];
          mesh.scale.y = rowScale;
          mesh.position.x = rowStartX + columnIndex * pillarSize.width;
          mesh.position.z = -rowIndex * rowSpacing;
        }
      }
    };

    const alignPillarsToScreenBottom = () => {
      const targetNdcY = -1;
      let low = -30;
      let high = 30;

      camera.updateMatrixWorld();
      for (let i = 0; i < 32; i += 1) {
        const mid = (low + high) / 2;
        const topPoint = new THREE.Vector3(0, mid, 0);
        topPoint.project(camera);

        if (topPoint.y > targetNdcY) {
          high = mid;
        } else {
          low = mid;
        }
      }

      const topY = (low + high) / 2;
      for (let rowIndex = 0; rowIndex < rowMeshes.length; rowIndex += 1) {
        const meshes = rowMeshes[rowIndex];
        const rowScale = 1 + rowIndex * rowHeightStep;
        const rowTopY = topY + rowIndex * pillarSize.height * rowHeightStep;
        for (const mesh of meshes) {
          mesh.scale.y = rowScale;
          mesh.position.y = rowTopY - (pillarSize.height * rowScale) / 2;
          mesh.userData.baseY = mesh.position.y;
        }
      }

      base.position.y =
        topY - (pillarSize.height / 2 + baseSize.height / 2);
      floor.position.y = base.position.y - baseSize.height / 2 - 0.1;
    };

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      const allMeshes = rowMeshes.flat();
      const time = performance.now() * 0.001;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allMeshes, false);
      hoveredMesh = intersects.length > 0 ? intersects[0].object : null;

      for (const mesh of allMeshes) {
        const baseY = mesh.userData.baseY ?? mesh.position.y;
        const currentLift = mesh.userData.currentLift ?? 0;
        const targetLift = mesh === hoveredMesh ? hoverLift : 0;
        const nextLift = currentLift + (targetLift - currentLift) * 0.35;
        const bobOffset = mesh.userData.bobOffset ?? 0;
        const bob = Math.sin(time * 0.6 + bobOffset) * 0.35;
        mesh.userData.currentLift = nextLift;
        mesh.position.y = baseY + bob + nextLift;
      }
      renderer.render(scene, camera);
    };

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerLeave = () => {
      mouse.set(2, 2);
      hoveredMesh = null;
    };

    const handleResize = () => {
      if (!mount) {
        return;
      }
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      layoutPillarsToScreenWidth();
      alignPillarsToScreenBottom();
    };

    layoutPillarsToScreenWidth();
    alignPillarsToScreenBottom();
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      window.cancelAnimationFrame(animationFrame);
      renderer.dispose();
      pillarGeometry.dispose();
      pillarSideMaterial.dispose();
      pillarTopMaterial.dispose();
      pillarBottomMaterial.dispose();
      pillarGradientMap.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Navbar />
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(12px, 1.4vw, 18px)',
            fontWeight: 600,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '6px',
          }}
        >
          Welcome To The
        </div>
        <div
          style={{
            fontSize: 'clamp(32px, 6vw, 72px)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            fontFamily:
              '"SF Pro Rounded", "Avenir Next Rounded", "Helvetica Rounded", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
            textTransform: 'uppercase',
            color: 'transparent',
            backgroundImage:
              'linear-gradient(120deg, rgba(255, 255, 255, 0.95), rgba(210, 245, 255, 0.45), rgba(255, 255, 255, 0.9))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            textShadow:
              '0 8px 24px rgba(9, 20, 28, 0.45), 0 2px 6px rgba(255, 255, 255, 0.35)',
            filter: 'drop-shadow(0 12px 28px rgba(4, 12, 18, 0.35))',
          }}
        >
          Integration Station
        </div>
      </div>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #000000 0%, #c5e0cd 100%)',
        }}
      />
    </div>
  );
}
