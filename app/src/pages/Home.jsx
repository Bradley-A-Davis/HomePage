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
    let tappedMesh = null;
    let tapLiftTimeout = null;
    let launchingMesh = null;
    let pendingLaunchUrl = null;

    const ambient = new THREE.AmbientLight('#f7e6ff', 0.7);
    scene.add(ambient);

    const hemisphere = new THREE.HemisphereLight('#ffffff', '#2a143f', 1.1);
    scene.add(hemisphere);

    const sunLight = new THREE.DirectionalLight('#ffffff', 1.25);
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
    const linkConfigs = [
      {
        url: 'https://admin.davisbisbee.com',
        color: '#3b82f6',
        emissive: '#1d4ed8',
        image: '/sprites/admin4.png',
      },{
        url: 'https://bradley.davisbisbee.com',
        color: '#be3bf6',
        emissive: '#6e1dd8',
        image: '/sprites/bradres1.png',
      },{
        url: 'https://cassidy.davisbisbee.com',
        color: '#f497ee',
        emissive: '#bc6ecc',
        image: '/sprites/cassidy3.png',
      },{
        url: 'https://music.davisbisbee.com',
        color: '#ebf497',
        emissive: '#c9cc6e',
        image: '/sprites/music1.png',
      },{
        url: 'https://card.davisbisbee.com',
        color: '#f4c497',
        emissive: '#cc976e',
        image: '/sprites/card1.png',
      },{
        url: 'https://games.davisbisbee.com',
        color: '#b0f497',
        emissive: '#73cc6e',
        image: '/sprites/games1.png',
      },
    ];
    const textureLoader = new THREE.TextureLoader();
    const linkMaterials = linkConfigs.map((config) => {
      const materials = pillarMaterial.map((material) => material.clone());
      for (const material of materials) {
        if (material.color && config.color) {
          material.color.set(config.color);
        }
        if (material.emissive && config.emissive) {
          material.emissive.set(config.emissive);
          material.emissiveIntensity = 0.22;
        }
      }
      return materials;
    });
    const linkSprites = linkConfigs.map((config) => {
      if (!config.image) {
        return null;
      }
      const texture = textureLoader.load(config.image);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.2, 2.2, 1);
      sprite.visible = false;
      scene.add(sprite);
      return { texture, spriteMaterial, sprite };
    });
    const rowGroups = [];
    const rowMeshes = [];
    const rowHeightStep = 0.17;
    const linkMeshesByIndex = [];

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
    const launchLift = 14;
    const launchDuration = 1200;

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
      const screenMinX = Math.min(leftEdge, rightEdge);
      const screenMaxX = Math.max(leftEdge, rightEdge);
      const padding = 10;
      const minX = Math.min(leftEdge, rightEdge) - padding;
      const maxX = Math.max(leftEdge, rightEdge) + padding;
      const startX = Math.floor(minX / pillarSize.width) * pillarSize.width;
      const endX = Math.ceil(maxX / pillarSize.width) * pillarSize.width;
      const baseCount =
        Math.round((endX - startX) / pillarSize.width) + 1;
      const rowSpacing = pillarSize.depth;
      linkMeshesByIndex.length = 0;
      let linkIndex = 0;

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
        const linkColumnIndices = new Map();
        if (rowIndex >= 1) {
          const centerIndex = (columns - 1) / 2;
          const orderedIndices = [...visibleIndices].sort(
            (a, b) =>
              Math.abs(a - centerIndex) - Math.abs(b - centerIndex)
          );
          for (const columnIndex of orderedIndices) {
            if (linkIndex >= linkConfigs.length) {
              break;
            }
            const columnX = rowStartX + columnIndex * pillarSize.width;
            if (columnX < screenMinX || columnX > screenMaxX) {
              continue;
            }
            linkColumnIndices.set(columnIndex, linkIndex);
            linkIndex += 1;
          }
        }
        for (let i = 0; i < meshes.length; i += 1) {
          const mesh = meshes[i];
          const columnIndex = visibleIndices[i];
          mesh.scale.y = rowScale;
          mesh.position.x = rowStartX + columnIndex * pillarSize.width;
          mesh.position.z = -rowIndex * rowSpacing;
          const linkConfigIndex = linkColumnIndices.get(columnIndex);
          if (linkConfigIndex !== undefined) {
            mesh.material = linkMaterials[linkConfigIndex];
            mesh.userData.linkUrl = linkConfigs[linkConfigIndex].url;
            mesh.userData.linkIndex = linkConfigIndex;
            linkMeshesByIndex[linkConfigIndex] = mesh;
          } else {
            mesh.material = pillarMaterial;
            mesh.userData.linkUrl = null;
            mesh.userData.linkIndex = null;
          }
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
      const nowMs = performance.now();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allMeshes, false);
      hoveredMesh = intersects.length > 0 ? intersects[0].object : null;
      renderer.domElement.style.cursor =
        hoveredMesh && hoveredMesh.userData.linkUrl && !launchingMesh
          ? 'pointer'
          : 'default';

      for (const mesh of allMeshes) {
        const baseY = mesh.userData.baseY ?? mesh.position.y;
        const currentLift = mesh.userData.currentLift ?? 0;
        let targetLift =
          mesh === hoveredMesh || mesh === tappedMesh ? hoverLift : 0;
        if (mesh.userData.launchStart) {
          const elapsed = (nowMs - mesh.userData.launchStart) / launchDuration;
          const clamped = Math.min(Math.max(elapsed, 0), 1);
          const eased = clamped * clamped * clamped;
          const extraTime = Math.max(elapsed - 1, 0);
          const extraLift = extraTime * extraTime * 8;
          targetLift =
            hoverLift + (launchLift - hoverLift) * eased + extraLift;
          if (
            elapsed >= 1 &&
            mesh === launchingMesh &&
            pendingLaunchUrl &&
            !mesh.userData.launchTriggered
          ) {
            mesh.userData.launchTriggered = true;
            const url = pendingLaunchUrl;
            pendingLaunchUrl = null;
            window.location.assign(url);
          }
        }
        const speed = mesh.userData.launchStart ? 0.5 : 0.35;
        const nextLift = currentLift + (targetLift - currentLift) * speed;
        const bobOffset = mesh.userData.bobOffset ?? 0;
        const bob = Math.sin(time * 0.6 + bobOffset) * 0.35;
        mesh.userData.currentLift = nextLift;
        mesh.position.y = baseY + bob + nextLift;
      }
      for (let i = 0; i < linkSprites.length; i += 1) {
        const spriteEntry = linkSprites[i];
        if (!spriteEntry) {
          continue;
        }
        const mesh = linkMeshesByIndex[i];
        if (mesh) {
          spriteEntry.sprite.visible = true;
          spriteEntry.sprite.position.set(
            mesh.position.x,
            mesh.position.y + pillarSize.height * mesh.scale.y * 0.7,
            mesh.position.z
          );
          spriteEntry.sprite.lookAt(camera.position);
        } else {
          spriteEntry.sprite.visible = false;
        }
      }
      renderer.render(scene, camera);
    };

    const updatePointerFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (event) => {
      updatePointerFromEvent(event);
    };

    const handlePointerLeave = () => {
      mouse.set(2, 2);
      hoveredMesh = null;
      renderer.domElement.style.cursor = 'default';
    };

    const triggerLaunch = (mesh) => {
      if (!mesh || !mesh.userData.linkUrl || launchingMesh) {
        return;
      }
      launchingMesh = mesh;
      pendingLaunchUrl = mesh.userData.linkUrl;
      mesh.userData.launchStart = performance.now();
      mesh.userData.launchTriggered = false;
    };

    const handlePointerDown = (event) => {
      if (launchingMesh) {
        return;
      }
      updatePointerFromEvent(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rowMeshes.flat(), false);
      const hitMesh = intersects.length > 0 ? intersects[0].object : null;
      if (!hitMesh || !hitMesh.userData.linkUrl) {
        tappedMesh = null;
        return;
      }

      const isTouch = event.pointerType === 'touch';
      if (!isTouch) {
        triggerLaunch(hitMesh);
        return;
      }

      if (tappedMesh === hitMesh) {
        tappedMesh = null;
        if (tapLiftTimeout) {
          window.clearTimeout(tapLiftTimeout);
          tapLiftTimeout = null;
        }
        triggerLaunch(hitMesh);
        return;
      }

      tappedMesh = hitMesh;
      if (tapLiftTimeout) {
        window.clearTimeout(tapLiftTimeout);
      }
      tapLiftTimeout = window.setTimeout(() => {
        if (tappedMesh === hitMesh) {
          tappedMesh = null;
        }
      }, 1500);
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
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (tapLiftTimeout) {
        window.clearTimeout(tapLiftTimeout);
      }
      window.cancelAnimationFrame(animationFrame);
      renderer.dispose();
      pillarGeometry.dispose();
      pillarSideMaterial.dispose();
      pillarTopMaterial.dispose();
      pillarBottomMaterial.dispose();
      pillarGradientMap.dispose();
      for (const materials of linkMaterials) {
        for (const material of materials) {
          material.dispose();
        }
      }
      for (const spriteEntry of linkSprites) {
        if (!spriteEntry) {
          continue;
        }
        spriteEntry.texture.dispose();
        spriteEntry.spriteMaterial.dispose();
      }
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
