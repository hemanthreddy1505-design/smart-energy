import * as THREE from 'three';

/**
 * High-Fidelity Procedural 3D Models for Virtual Flat Appliances and Furniture
 */

// 1. Air Conditioner (Indoor Wall Unit)
export function createAirConditionerMesh(isOn) {
  const group = new THREE.Group();

  // Main chassis with beveled look
  const bodyGeo = new THREE.BoxGeometry(1.25, 0.38, 0.28);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Front glossy accent strip
  const stripGeo = new THREE.BoxGeometry(1.26, 0.04, 0.01);
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.8
  });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(0, 0.05, 0.141);
  group.add(strip);

  // Front louver vent
  const ventGeo = new THREE.BoxGeometry(1.15, 0.07, 0.05);
  const ventMat = new THREE.MeshStandardMaterial({
    color: isOn ? 0x00A86B : 0x64748b,
    emissive: isOn ? 0x00A86B : 0x000000,
    emissiveIntensity: isOn ? 0.5 : 0
  });
  const vent = new THREE.Mesh(ventGeo, ventMat);
  vent.position.set(0, -0.12, 0.14);
  group.add(vent);

  // Status LED Display (24°C / ON / OFF)
  const ledGeo = new THREE.PlaneGeometry(0.14, 0.05);
  const ledMat = new THREE.MeshBasicMaterial({
    color: isOn ? 0x10B981 : 0xef4444
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.42, 0.06, 0.142);
  group.add(led);

  // Cooling Airflow Particles Stream (when ON)
  if (isOn) {
    const flowGeo = new THREE.ConeGeometry(0.45, 0.9, 12);
    const flowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    });
    const flow = new THREE.Mesh(flowGeo, flowMat);
    flow.rotation.x = Math.PI * 0.78;
    flow.position.set(0, -0.52, 0.4);
    group.add(flow);
  }

  group.userData = { type: 'AC' };
  return group;
}

// 2. Refrigerator (Double Door)
export function createRefrigeratorMesh(isOn) {
  const group = new THREE.Group();

  // Main tall body
  const bodyGeo = new THREE.BoxGeometry(0.8, 1.7, 0.8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.25,
    metalness: 0.6
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Top Freezer Door & Bottom Fridge Door divider
  const dividerGeo = new THREE.BoxGeometry(0.81, 0.03, 0.02);
  const dividerMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
  const divider = new THREE.Mesh(dividerGeo, dividerMat);
  divider.position.set(0, 0.22, 0.41);
  group.add(divider);

  // Chrome Vertical Handles
  const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  
  const handleTop = new THREE.Mesh(handleGeo, handleMat);
  handleTop.position.set(-0.32, 0.48, 0.43);
  group.add(handleTop);

  const handleBottom = new THREE.Mesh(handleGeo, handleMat);
  handleBottom.position.set(-0.32, -0.28, 0.43);
  group.add(handleBottom);

  // Digital Inverter LED
  const ledGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({ color: isOn ? 0x00A86B : 0x94a3b8 });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.32, 0.72, 0.41);
  group.add(led);

  // Bottom ventilation grille
  const ventGeo = new THREE.BoxGeometry(0.72, 0.08, 0.02);
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
  const vent = new THREE.Mesh(ventGeo, ventMat);
  vent.position.set(0, -0.78, 0.41);
  group.add(vent);

  group.userData = { type: 'REFRIGERATOR' };
  return group;
}

// 3. Smart Television (Thin Bezel Flat Screen + Console)
export function createTelevisionMesh(isOn) {
  const group = new THREE.Group();

  // TV Media Console / Stand table
  const standGeo = new THREE.BoxGeometry(1.6, 0.35, 0.45);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });
  const stand = new THREE.Mesh(standGeo, standMat);
  stand.position.set(0, -0.35, 0);
  stand.castShadow = true;
  group.add(stand);

  // TV Outer Frame / Bezel
  const frameGeo = new THREE.BoxGeometry(1.4, 0.82, 0.05);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.35, 0);
  frame.castShadow = true;
  group.add(frame);

  // TV Base Pedestal
  const baseGeo = new THREE.BoxGeometry(0.4, 0.02, 0.25);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, -0.06, 0);
  group.add(base);

  const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12);
  const pole = new THREE.Mesh(poleGeo, baseMat);
  pole.position.set(0, -0.01, 0);
  group.add(pole);

  // TV Screen Display Surface (Glows when ON)
  const screenGeo = new THREE.PlaneGeometry(1.36, 0.78);
  const screenMat = new THREE.MeshStandardMaterial({
    color: isOn ? 0x38bdf8 : 0x020617,
    emissive: isOn ? 0x0284c7 : 0x000000,
    emissiveIntensity: isOn ? 0.85 : 0,
    roughness: 0.1,
    metalness: 0.3
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.35, 0.027);
  group.add(screen);

  // Power Standby LED
  const ledGeo = new THREE.SphereGeometry(0.012, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({ color: isOn ? 0x00A86B : 0xef4444 });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0, -0.045, 0.028);
  group.add(led);

  group.userData = { type: 'TV' };
  return group;
}

// 4. Workstation PC (Dual Curved Monitor + Desk + RGB Case)
export function createWorkstationMesh(isOn) {
  const group = new THREE.Group();

  // Modern Office Desk
  const deskGeo = new THREE.BoxGeometry(1.5, 0.06, 0.8);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.set(0, 0, 0);
  desk.castShadow = true;
  group.add(desk);

  // Metal Legs
  const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 });
  [[-0.68, -0.36, -0.35], [0.68, -0.36, -0.35], [-0.68, -0.36, 0.35], [0.68, -0.36, 0.35]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // Ergonomic Office Chair
  const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, -0.28, 0.55);
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(0.48, 0.55, 0.06);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(0, 0.02, 0.78);
  group.add(back);

  // Primary Ultrawide Curved Monitor
  const monitorGeo = new THREE.BoxGeometry(1.1, 0.48, 0.04);
  const monitorMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.7 });
  const monitor = new THREE.Mesh(monitorGeo, monitorMat);
  monitor.position.set(0, 0.38, -0.15);
  group.add(monitor);

  // Monitor Stand
  const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
  const arm = new THREE.Mesh(armGeo, monitorMat);
  arm.position.set(0, 0.15, -0.18);
  group.add(arm);

  // Active glowing IDE screen
  const screenGeo = new THREE.PlaneGeometry(1.06, 0.44);
  const screenMat = new THREE.MeshStandardMaterial({
    color: isOn ? 0x00A86B : 0x020617,
    emissive: isOn ? 0x00A86B : 0x000000,
    emissiveIntensity: isOn ? 0.75 : 0,
    roughness: 0.2
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.38, -0.128);
  group.add(screen);

  // Mechanical Keyboard & Mouse
  const kbGeo = new THREE.BoxGeometry(0.45, 0.015, 0.16);
  const kbMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    emissive: isOn ? 0x00A86B : 0x000000,
    emissiveIntensity: isOn ? 0.3 : 0
  });
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(-0.05, 0.038, 0.15);
  group.add(kb);

  const mouseGeo = new THREE.BoxGeometry(0.06, 0.025, 0.1);
  const mouseMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
  const mouse = new THREE.Mesh(mouseGeo, mouseMat);
  mouse.position.set(0.28, 0.038, 0.15);
  group.add(mouse);

  // Mid-Tower PC Chassis
  const towerGeo = new THREE.BoxGeometry(0.22, 0.45, 0.45);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.2,
    metalness: 0.8
  });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.position.set(0.58, 0.25, -0.1);
  tower.castShadow = true;
  group.add(tower);

  // RGB Fan Glow inside tempered glass
  if (isOn) {
    const rgbGeo = new THREE.RingGeometry(0.04, 0.07, 16);
    const rgbMat = new THREE.MeshBasicMaterial({ color: 0x10B981, side: THREE.DoubleSide });
    const rgb = new THREE.Mesh(rgbGeo, rgbMat);
    rgb.position.set(0.468, 0.3, -0.05);
    rgb.rotation.y = Math.PI / 2;
    group.add(rgb);
  }

  group.userData = { type: 'PC' };
  return group;
}

// 5. Living Room Lighting (Ceiling Luminaire Fixture with real PointLight)
export function createLEDLightMesh(isOn) {
  const group = new THREE.Group();

  // Ceiling mounting disc
  const baseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, 0, 0);
  group.add(base);

  // Hanging Downrod
  const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2);
  const rod = new THREE.Mesh(rodGeo, baseMat);
  rod.position.set(0, -0.1, 0);
  group.add(rod);

  // Frosted Glass Dome Lamp
  const domeGeo = new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const domeMat = new THREE.MeshStandardMaterial({
    color: isOn ? 0xfffaed : 0xe2e8f0,
    emissive: isOn ? 0xfff1aa : 0x000000,
    emissiveIntensity: isOn ? 1.2 : 0,
    transparent: true,
    opacity: 0.92,
    roughness: 0.1
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.rotation.x = Math.PI;
  dome.position.set(0, -0.2, 0);
  group.add(dome);

  // Embedded PointLight that illuminates the 3D room
  const pointLight = new THREE.PointLight(0xfffaed, isOn ? 1.8 : 0, 10, 1.2);
  pointLight.position.set(0, -0.25, 0);
  pointLight.castShadow = true;
  group.add(pointLight);

  group.userData = { type: 'LIGHTING' };
  return group;
}

// 6. Ceiling Fan (BLDC Motor + Spinning Rotor Blades)
export function createCeilingFanMesh(isOn) {
  const group = new THREE.Group();

  // Ceiling mounting canopy & downrod
  const mountGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
  const mountMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7 });
  const mount = new THREE.Mesh(mountGeo, mountMat);
  group.add(mount);

  const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.35);
  const rod = new THREE.Mesh(rodGeo, mountMat);
  rod.position.set(0, -0.18, 0);
  group.add(rod);

  // Motor Housing
  const motorGeo = new THREE.CylinderGeometry(0.2, 0.16, 0.12, 24);
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 });
  const motor = new THREE.Mesh(motorGeo, motorMat);
  motor.position.set(0, -0.36, 0);
  group.add(motor);

  // Rotating Blades Hub (named 'blades' for animation loop)
  const bladesGroup = new THREE.Group();
  bladesGroup.name = 'blades';
  bladesGroup.position.set(0, -0.38, 0);

  // 3 Aerodynamic Curved Blades
  const bladeMat = new THREE.MeshStandardMaterial({
    color: isOn ? 0x00A86B : 0x374151,
    roughness: 0.3,
    metalness: 0.2
  });

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const bladeGeo = new THREE.BoxGeometry(0.85, 0.015, 0.14);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(Math.cos(angle) * 0.48, 0, Math.sin(angle) * 0.48);
    blade.rotation.y = -angle;
    blade.rotation.z = 0.06; // Pitch angle
    bladesGroup.add(blade);
  }

  group.add(bladesGroup);
  group.userData = { type: 'FAN' };
  return group;
}

// 7. Washing Machine (Front-Load + Glass Door + Rotating Drum)
export function createWashingMachineMesh(isOn) {
  const group = new THREE.Group();

  // White Enamel Washer Cabinet
  const bodyGeo = new THREE.BoxGeometry(0.72, 0.88, 0.68);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.2 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Top Control Console with Digital LED Display
  const panelGeo = new THREE.BoxGeometry(0.72, 0.16, 0.02);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 0.34, 0.341);
  group.add(panel);

  const dialGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.025, 16);
  const dialMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
  const dial = new THREE.Mesh(dialGeo, dialMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0.12, 0.34, 0.355);
  group.add(dial);

  // Digital LED Timer
  const timerGeo = new THREE.PlaneGeometry(0.12, 0.05);
  const timerMat = new THREE.MeshBasicMaterial({ color: isOn ? 0x00A86B : 0x475569 });
  const timer = new THREE.Mesh(timerGeo, timerMat);
  timer.position.set(-0.16, 0.34, 0.355);
  group.add(timer);

  // Front Circular Glass Door Frame
  const doorRingGeo = new THREE.TorusGeometry(0.24, 0.035, 16, 32);
  const doorRingMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.85, roughness: 0.2 });
  const doorRing = new THREE.Mesh(doorRingGeo, doorRingMat);
  doorRing.position.set(0, -0.06, 0.345);
  group.add(doorRing);

  // Tinted Glass Window
  const glassGeo = new THREE.CircleGeometry(0.22, 32);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, -0.06, 0.346);
  group.add(glass);

  // Rotating Inner Drum (named 'drum')
  const drumGroup = new THREE.Group();
  drumGroup.name = 'drum';
  drumGroup.position.set(0, -0.06, 0.2);

  const drumGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16);
  const drumMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9, wireframe: true });
  const drum = new THREE.Mesh(drumGeo, drumMat);
  drum.rotation.x = Math.PI / 2;
  drumGroup.add(drum);

  group.add(drumGroup);
  group.userData = { type: 'WASHING_MACHINE' };
  return group;
}

// 8. Water Heater / Geyser (Vertical Cylindrical Wall-Mounted)
export function createWaterHeaterMesh(isOn) {
  const group = new THREE.Group();

  // Cylindrical Tank Body
  const tankGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.85, 24);
  const tankMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.2
  });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.castShadow = true;
  group.add(tank);

  // Top and Bottom Rounded Caps
  const capGeo = new THREE.SphereGeometry(0.28, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const capTop = new THREE.Mesh(capGeo, tankMat);
  capTop.position.set(0, 0.42, 0);
  group.add(capTop);

  const capBottom = new THREE.Mesh(capGeo, tankMat);
  capBottom.rotation.x = Math.PI;
  capBottom.position.set(0, -0.42, 0);
  group.add(capBottom);

  // Temperature Dial & Heating LED Display
  const displayGeo = new THREE.PlaneGeometry(0.16, 0.2);
  const displayMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.set(0, 0, 0.282);
  group.add(display);

  // Heating Element Status LED (Red heating coil indicator when ON)
  const ledGeo = new THREE.CircleGeometry(0.035, 16);
  const ledMat = new THREE.MeshBasicMaterial({ color: isOn ? 0xef4444 : 0x00A86B });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0, 0.03, 0.285);
  group.add(led);

  // Inlet (Blue) & Outlet (Red) Water Copper Pipes
  const pipeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
  const coldMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const hotMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

  const coldPipe = new THREE.Mesh(pipeGeo, coldMat);
  coldPipe.position.set(-0.12, -0.52, 0);
  group.add(coldPipe);

  const hotPipe = new THREE.Mesh(pipeGeo, hotMat);
  hotPipe.position.set(0.12, -0.52, 0);
  group.add(hotPipe);

  group.userData = { type: 'GEYSER' };
  return group;
}

// 9. Transformer Substation (10 kVA Virtual Transformer in Yard)
export function createTransformerSubstationMesh(loadPercentage = 35) {
  const group = new THREE.Group();

  // Concrete Base Plinth
  const plinthGeo = new THREE.BoxGeometry(1.6, 0.15, 1.4);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, 0.075, 0);
  plinth.receiveShadow = true;
  group.add(plinth);

  // Transformer Metal Body Tank
  const tankGeo = new THREE.BoxGeometry(0.9, 0.9, 0.7);
  const tankMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a34,
    roughness: 0.4,
    metalness: 0.6
  });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.set(0, 0.6, 0);
  tank.castShadow = true;
  group.add(tank);

  // Cooling Radiator Fins on sides
  const finGeo = new THREE.BoxGeometry(0.04, 0.7, 0.6);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x142b26 });
  [-0.48, -0.55, 0.48, 0.55].forEach(x => {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(x, 0.6, 0);
    group.add(fin);
  });

  // Top Ceramic High Voltage Insulators (3 Bushings)
  const bushGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.25, 8);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.2 });
  [-0.25, 0, 0.25].forEach(x => {
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(x, 1.18, 0);
    group.add(bush);
  });

  // Top Conservator Tank Drum
  const consGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.65, 16);
  const cons = new THREE.Mesh(consGeo, tankMat);
  cons.rotation.z = Math.PI / 2;
  cons.position.set(0, 1.25, -0.2);
  group.add(cons);

  // Status Indicator Glow on Substation
  const ledGeo = new THREE.SphereGeometry(0.035, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({
    color: loadPercentage > 85 ? 0xef4444 : 0x00A86B
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.35, 0.95, 0.36);
  group.add(led);

  group.userData = { type: 'TRANSFORMER' };
  return group;
}

// 10. Main Distribution Board (40A MCB Panel)
export function createDistributionBoardMesh(isActive = true) {
  const group = new THREE.Group();

  // Metallic Enclosure
  const boxGeo = new THREE.BoxGeometry(0.55, 0.75, 0.18);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.7
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.castShadow = true;
  group.add(box);

  // Smoked Acrylic Front Window
  const glassGeo = new THREE.PlaneGeometry(0.46, 0.62);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 0, 0.092);
  group.add(glass);

  // Row of MCB Breakers
  const mcbGeo = new THREE.BoxGeometry(0.04, 0.12, 0.06);
  const mcbMat = new THREE.MeshStandardMaterial({ color: isActive ? 0x00A86B : 0xef4444 });
  for (let i = -3; i <= 3; i++) {
    const mcb = new THREE.Mesh(mcbGeo, mcbMat);
    mcb.position.set(i * 0.06, 0.08, 0.04);
    group.add(mcb);
  }

  // Digital Ammeter & Voltmeter Display
  const meterGeo = new THREE.PlaneGeometry(0.24, 0.08);
  const meterMat = new THREE.MeshBasicMaterial({ color: isActive ? 0x10B981 : 0x64748b });
  const meter = new THREE.Mesh(meterGeo, meterMat);
  meter.position.set(0, -0.18, 0.093);
  group.add(meter);

  group.userData = { type: 'MDB' };
  return group;
}

// 11. Living Room Furniture (Sofa + Coffee Table + Rug)
export function createLivingRoomFurniture() {
  const group = new THREE.Group();

  // Modern Fabric 3-Seater Sofa
  const seatGeo = new THREE.BoxGeometry(2.2, 0.3, 0.85);
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const seat = new THREE.Mesh(seatGeo, sofaMat);
  seat.position.set(3.0, 0.18, 3.2);
  seat.castShadow = true;
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(2.2, 0.55, 0.25);
  const back = new THREE.Mesh(backGeo, sofaMat);
  back.position.set(3.0, 0.52, 3.65);
  group.add(back);

  // Minimalist Coffee Table
  const tableGeo = new THREE.BoxGeometry(1.2, 0.04, 0.6);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(3.0, 0.24, 1.8);
  table.castShadow = true;
  group.add(table);

  // Area Rug
  const rugGeo = new THREE.PlaneGeometry(2.6, 2.0);
  const rugMat = new THREE.MeshStandardMaterial({ color: 0x1e3a34, roughness: 1.0 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(3.0, 0.01, 2.4);
  group.add(rug);

  group.userData = { isRoomElement: true };
  return group;
}

// 12. Master Bedroom Furniture (Bed + Nightstands)
export function createBedroomFurniture() {
  const group = new THREE.Group();

  // Queen Bed Frame & Mattress
  const bedGeo = new THREE.BoxGeometry(2.0, 0.35, 2.2);
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(9.0, 0.2, 2.4);
  bed.castShadow = true;
  group.add(bed);

  // White Linen Duvet
  const duvetGeo = new THREE.BoxGeometry(1.9, 0.08, 1.6);
  const duvetMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const duvet = new THREE.Mesh(duvetGeo, duvetMat);
  duvet.position.set(9.0, 0.4, 2.6);
  group.add(duvet);

  // Upholstered Headboard
  const headGeo = new THREE.BoxGeometry(2.1, 0.9, 0.15);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(9.0, 0.55, 1.25);
  group.add(head);

  // Two Pillows
  const pillowGeo = new THREE.BoxGeometry(0.65, 0.12, 0.4);
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  [-0.45, 0.45].forEach(dx => {
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(9.0 + dx, 0.45, 1.55);
    group.add(pillow);
  });

  group.userData = { isRoomElement: true };
  return group;
}

// 13. Kitchen Furniture (Modular Counters + Sink + Island)
export function createKitchenFurniture() {
  const group = new THREE.Group();

  // Kitchen Base Counter (L-Shape or straight)
  const counterGeo = new THREE.BoxGeometry(2.6, 0.85, 0.65);
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const counter = new THREE.Mesh(counterGeo, counterMat);
  counter.position.set(2.8, 0.425, 6.0);
  counter.castShadow = true;
  group.add(counter);

  // Polished Stone Countertop
  const topGeo = new THREE.BoxGeometry(2.64, 0.05, 0.68);
  const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.2 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(2.8, 0.86, 6.0);
  group.add(top);

  // Sink & Chrome Faucet
  const sinkGeo = new THREE.BoxGeometry(0.6, 0.02, 0.4);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const sink = new THREE.Mesh(sinkGeo, sinkMat);
  sink.position.set(2.4, 0.89, 6.0);
  group.add(sink);

  const faucetGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25);
  const faucet = new THREE.Mesh(faucetGeo, sinkMat);
  faucet.position.set(2.4, 1.02, 5.82);
  group.add(faucet);

  group.userData = { isRoomElement: true };
  return group;
}

// 14. Bathroom Furniture (Vanity Counter + Washbasin + Mirror)
export function createBathroomFurniture() {
  const group = new THREE.Group();

  // Vanity Cabinet
  const vanityGeo = new THREE.BoxGeometry(1.2, 0.75, 0.55);
  const vanityMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const vanity = new THREE.Mesh(vanityGeo, vanityMat);
  vanity.position.set(5.5, 0.375, 10.2);
  vanity.castShadow = true;
  group.add(vanity);

  // Porcelain Sink Basin
  const basinGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.14, 24);
  const basinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const basin = new THREE.Mesh(basinGeo, basinMat);
  basin.position.set(5.5, 0.82, 10.2);
  group.add(basin);

  // Wall Mirror
  const mirrorGeo = new THREE.BoxGeometry(1.0, 0.8, 0.03);
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.05, metalness: 0.95 });
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.position.set(5.5, 1.55, 9.6);
  group.add(mirror);

  group.userData = { isRoomElement: true };
  return group;
}
