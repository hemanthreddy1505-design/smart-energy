import * as THREE from 'three';
import {
  createAirConditionerMesh,
  createRefrigeratorMesh,
  createWorkstationMesh,
  createTelevisionMesh,
  createCeilingFanMesh,
  createWaterHeaterMesh,
  createWashingMachineMesh,
  createLEDLightMesh,
  createTransformerSubstationMesh,
  createDistributionBoardMesh,
  createLivingRoomFurniture,
  createBedroomFurniture,
  createKitchenFurniture,
  createBathroomFurniture
} from './Appliance3DModels';
import { CableFlow3D } from './CableFlow3D';

/**
 * Generates a high-resolution CanvasTexture for floating ground measurement labels
 * Format:
 * DEVICE NAME
 * ON / OFF
 * Power: XXX W
 * Current: X.XX A
 */
function createGroundLabelTexture(app, activePower, currentAmps) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  // Background rounded glassmorphism badge
  ctx.fillStyle = app.isOn ? 'rgba(6, 28, 22, 0.95)' : 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = app.isOn ? '#00A86B' : '#475569';
  ctx.lineWidth = 4;

  const r = 24;
  const w = 504;
  const h = 192;
  const x = 4;
  const y = 4;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Status Indicator Dot
  ctx.beginPath();
  ctx.arc(40, 50, 14, 0, Math.PI * 2);
  ctx.fillStyle = app.isOn ? '#00A86B' : '#64748b';
  ctx.fill();

  // Primary: Device Name
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(app.name.toUpperCase(), 70, 58);

  // Status Pill: ON / OFF
  ctx.font = 'bold 24px "SF Mono", Menlo, Consolas, monospace';
  ctx.fillStyle = app.isOn ? '#10B981' : '#94a3b8';
  ctx.fillText(app.isOn ? 'STATE: ENERGIZED (ON)' : 'STATE: STANDBY (OFF)', 40, 106);

  // Telemetry: Power: XXX W
  ctx.font = 'bold 28px "SF Mono", Menlo, Consolas, monospace';
  ctx.fillStyle = app.isOn ? '#FFFFFF' : '#94a3b8';
  ctx.fillText(`Power: ${app.isOn ? activePower : 0} W`, 40, 146);

  // Telemetry: Current: X.XX A
  ctx.font = '24px "SF Mono", Menlo, Consolas, monospace';
  ctx.fillStyle = app.isOn ? '#10B981' : '#64748b';
  ctx.fillText(`Current: ${app.isOn ? currentAmps : '0.00'} A`, 40, 180);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export class BuildingScene {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.onDeviceClick = options.onDeviceClick || (() => {});
    this.onDeviceHover = options.onDeviceHover || (() => {});

    this.deviceMeshes = new Map();
    this.groundLabels = new Map();
    this.animatingFans = [];
    this.animatingDrums = [];
    this.isDisposed = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x061C16);
    this.scene.fog = new THREE.FogExp2(0x061C16, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(13, 14, 18);
    this.camera.lookAt(5.5, 1, 5.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(14, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    this.scene.add(sunLight);

    const greenAccentLight = new THREE.PointLight(0x00A86B, 2.0, 25);
    greenAccentLight.position.set(-3, 5, 4);
    this.scene.add(greenAccentLight);

    // 5. Grid Ground Plane
    const gridHelper = new THREE.GridHelper(36, 36, 0x00A86B, 0x143328);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // 6. Cable Conduit Manager
    this.cableFlow = new CableFlow3D(this.scene);

    // 7. Mouse Orbit & Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };

    this.setupInteraction();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupInteraction() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;

        const rotSpeed = 0.005;
        this.camera.position.x = this.camera.position.x * Math.cos(deltaX * rotSpeed) + this.camera.position.z * Math.sin(deltaX * rotSpeed);
        this.camera.position.z = -this.camera.position.x * Math.sin(deltaX * rotSpeed) + this.camera.position.z * Math.cos(deltaX * rotSpeed);
        this.camera.position.y = Math.max(2, Math.min(26, this.camera.position.y - deltaY * rotSpeed * 3));
        this.camera.lookAt(5.5, 1, 5.5);

        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.01;
      this.camera.position.multiplyScalar(1 + zoomFactor * 0.1);
      this.camera.position.clampLength(4, 40);
    }, { passive: false });

    el.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const meshes = Array.from(this.deviceMeshes.values());
      const intersects = this.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let topGroup = intersects[0].object;
        while (topGroup.parent && topGroup.parent !== this.scene) {
          if (topGroup.userData?.applianceId) break;
          topGroup = topGroup.parent;
        }
        if (topGroup.userData?.applianceId) {
          this.onDeviceClick(topGroup.userData.applianceId);
        }
      }
    });
  }

  /**
   * Rebuild the entire 3D Virtual Flat with all 6 rooms, furniture, transformer, MDB, and 8 appliances
   */
  updateBuilding(rooms, appliances, transformer, distributionBoard) {
    // Clear old device meshes and labels
    this.deviceMeshes.forEach(mesh => this.scene.remove(mesh));
    this.deviceMeshes.clear();
    this.groundLabels.forEach(mesh => this.scene.remove(mesh));
    this.groundLabels.clear();
    this.animatingFans = [];
    this.animatingDrums = [];
    this.cableFlow.clear();

    // Clear old room geometry and furniture
    const toRemove = [];
    this.scene.children.forEach(child => {
      if (child.userData?.isRoomElement) toRemove.push(child);
    });
    toRemove.forEach(c => this.scene.remove(c));

    // 1. Build the 6 Rooms of the Virtual Flat
    rooms.forEach(room => {
      const [rx, ry, rz] = room.position || [0, 0, 0];
      const rw = room.width || 5.0;
      const rd = room.depth || 4.0;

      // Floor Tile Mesh with distinct room material
      let floorColor = 0x0e2e25;
      if (room.floorType === 'carpet') floorColor = 0x1e293b;
      else if (room.floorType === 'tile') floorColor = 0x1f3438;
      else if (room.floorType === 'slate') floorColor = 0x111827;
      else if (room.floorType === 'ceramic') floorColor = 0x163832;

      const floorGeo = new THREE.BoxGeometry(rw, 0.06, rd);
      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.5,
        metalness: 0.15
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(rx + rw / 2, 0, rz + rd / 2);
      floorMesh.receiveShadow = true;
      floorMesh.userData = { isRoomElement: true };
      this.scene.add(floorMesh);

      // Low cutaway perimeter & partition walls (0.45m high for open cutaway CAD view)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      
      // North Wall
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.45, 0.08), wallMat);
      wallN.position.set(rx + rw / 2, 0.225, rz);
      wallN.userData = { isRoomElement: true };
      this.scene.add(wallN);

      // West Wall
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, rd), wallMat);
      wallW.position.set(rx, 0.225, rz + rd / 2);
      wallW.userData = { isRoomElement: true };
      this.scene.add(wallW);
    });

    // 2. Add Room Furniture
    this.scene.add(createLivingRoomFurniture());
    this.scene.add(createBedroomFurniture());
    this.scene.add(createKitchenFurniture());
    this.scene.add(createBathroomFurniture());

    // 3. Transformer Substation in exterior yard [-3.2, 0, 3.5]
    const transformerMesh = createTransformerSubstationMesh(transformer?.loadPercentage || 35);
    transformerMesh.position.set(-3.2, 0, 3.5);
    transformerMesh.userData = { isRoomElement: true, isInfrastructure: true };
    this.scene.add(transformerMesh);

    // 4. Main Distribution Board (Mounted near entrance [0, 1.2, 2.5])
    const mdbPos = [0.05, 1.2, 2.5];
    const mdbMesh = createDistributionBoardMesh(distributionBoard?.totalActivePower > 0);
    mdbMesh.position.set(...mdbPos);
    mdbMesh.userData = { isRoomElement: true, isInfrastructure: true };
    this.scene.add(mdbMesh);

    // Main Trunk Conduit: Transformer -> MDB
    this.cableFlow.addCable([-3.2, 0.9, 3.5], mdbPos, true, transformer?.currentLoadW || 2000);

    // 5. Render All 8 Appliances with Floating Ground Measurement Labels & Cable Flow
    appliances.forEach(app => {
      let mesh = null;
      const appType = (app.type || app.id || '').toUpperCase();

      if (appType.includes('AC') || appType.includes('HVAC')) {
        mesh = createAirConditionerMesh(app.isOn);
      } else if (appType.includes('FR') || appType.includes('COLD') || appType.includes('REFRIGERATOR')) {
        mesh = createRefrigeratorMesh(app.isOn);
      } else if (appType.includes('PC') || appType.includes('COMPUTING')) {
        mesh = createWorkstationMesh(app.isOn);
      } else if (appType.includes('TV') || appType.includes('ENTERTAINMENT')) {
        mesh = createTelevisionMesh(app.isOn);
      } else if (appType.includes('FN') || appType.includes('FAN')) {
        mesh = createCeilingFanMesh(app.isOn);
        if (app.isOn) {
          const blades = mesh.getObjectByName('blades');
          if (blades) this.animatingFans.push(blades);
        }
      } else if (appType.includes('GH') || appType.includes('HEATER') || appType.includes('GEYSER')) {
        mesh = createWaterHeaterMesh(app.isOn);
      } else if (appType.includes('WM') || appType.includes('WASH')) {
        mesh = createWashingMachineMesh(app.isOn);
        if (app.isOn) {
          const drum = mesh.getObjectByName('drum');
          if (drum) this.animatingDrums.push(drum);
        }
      } else {
        mesh = createLEDLightMesh(app.isOn);
      }

      if (mesh) {
        const pos = app.position3D || [3, 0.8, 2.5];
        mesh.position.set(...pos);
        mesh.userData = { applianceId: app.id, name: app.name, isOn: app.isOn };
        this.scene.add(mesh);
        this.deviceMeshes.set(app.id, mesh);

        // Animated Electrical Conduit: MDB -> Appliance
        const activePower = app.activePowerW || (app.isOn ? app.ratedPower : 0);
        const currentAmps = app.currentA || (activePower > 0 ? (activePower / 230).toFixed(2) : '0.00');
        this.cableFlow.addCable(mdbPos, pos, app.isOn, activePower);

        // Floating Ground Measurement Label (High-DPI 2D sprite badge on floor)
        const labelTexture = createGroundLabelTexture(app, activePower, currentAmps);
        const labelGeo = new THREE.PlaneGeometry(1.6, 0.65);
        const labelMat = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide
        });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.rotation.x = -Math.PI / 2; // Flat on floor
        labelMesh.position.set(pos[0], 0.04, pos[2] + 0.8);
        labelMesh.userData = { isRoomElement: true, labelFor: app.id };
        this.scene.add(labelMesh);
        this.groundLabels.set(app.id, labelMesh);
      }
    });
  }

  /**
   * Set Camera Angle Preset to view individual rooms or whole flat
   */
  setCameraPreset(preset) {
    switch (preset) {
      case 'living':
        // Living Room Preset
        this.camera.position.set(3.0, 5.0, 7.5);
        this.camera.lookAt(3.0, 1.0, 2.5);
        break;
      case 'bedroom':
        // Master Bedroom Preset
        this.camera.position.set(9.2, 5.0, 6.8);
        this.camera.lookAt(9.0, 1.0, 2.2);
        break;
      case 'kitchen':
        // Kitchen Preset
        this.camera.position.set(2.2, 4.5, 9.5);
        this.camera.lookAt(2.2, 1.0, 7.5);
        break;
      case 'office':
        // Home Office Preset
        this.camera.position.set(9.0, 4.2, 8.8);
        this.camera.lookAt(8.5, 1.0, 6.7);
        break;
      case 'utility':
        // Utility Area Preset
        this.camera.position.set(1.5, 3.5, 13.5);
        this.camera.lookAt(1.5, 0.8, 11.2);
        break;
      case 'bathroom':
        // Bathroom Preset
        this.camera.position.set(5.5, 4.0, 12.8);
        this.camera.lookAt(5.5, 1.2, 10.5);
        break;
      case 'transformer':
        // Substation Transformer Yard Preset
        this.camera.position.set(-6.5, 3.8, 6.8);
        this.camera.lookAt(-3.2, 0.9, 3.5);
        break;
      case 'all':
      default:
        // Whole Flat Overview Preset
        this.camera.position.set(13, 14, 18);
        this.camera.lookAt(5.5, 1, 5.5);
        break;
    }
  }

  resize(width, height) {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (this.isDisposed) return;
    requestAnimationFrame(this.animate);

    // Rotate spinning ceiling fan blades
    this.animatingFans.forEach(blades => {
      blades.rotation.y += 0.22;
    });

    // Rotate washing machine drum
    this.animatingDrums.forEach(drum => {
      drum.rotation.z += 0.15;
    });

    // Animate electrical current pulses
    if (this.cableFlow) {
      this.cableFlow.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isDisposed = true;
    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer?.dispose();
  }
}
