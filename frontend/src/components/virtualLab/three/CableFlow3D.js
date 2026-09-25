import * as THREE from 'three';

/**
 * Creates 3D electrical cables with animated pulsating current flow particles
 */
export class CableFlow3D {
  constructor(scene) {
    this.scene = scene;
    this.cables = [];
    this.particles = [];
  }

  /**
   * Add an electrical cable path between two 3D vector points
   */
  addCable(startPoint, endPoint, isActive = true, currentLoadW = 100) {
    // Generate curved/routed path with standard elevation
    const p1 = new THREE.Vector3(...startPoint);
    const p2 = new THREE.Vector3(...endPoint);

    // Ceiling or floor conduit routing waypoint
    const midY = Math.max(p1.y, p2.y, 2.7);
    const waypoint1 = new THREE.Vector3(p1.x, midY, p1.z);
    const waypoint2 = new THREE.Vector3(p2.x, midY, p2.z);

    const curve = new THREE.CatmullRomCurve3([p1, waypoint1, waypoint2, p2]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.02, 8, false);

    // Conduit Material: glowing emerald if active, subtle gray if inactive
    const tubeMat = new THREE.MeshStandardMaterial({
      color: isActive ? 0x00A86B : 0x334155,
      emissive: isActive ? 0x00A86B : 0x000000,
      emissiveIntensity: isActive ? 0.4 : 0,
      roughness: 0.3,
      metalness: 0.8
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(tubeMesh);

    // Animated Current Pulse Particle
    let particleMesh = null;
    if (isActive) {
      const particleGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: currentLoadW > 1000 ? 0xf59e0b : 0x19C37D
      });
      particleMesh = new THREE.Mesh(particleGeo, particleMat);
      this.scene.add(particleMesh);
    }

    this.cables.push({
      mesh: tubeMesh,
      curve,
      particle: particleMesh,
      progress: Math.random(),
      isActive,
      speed: 0.006 + Math.min(0.02, (currentLoadW / 2000) * 0.015)
    });
  }

  /**
   * Animation tick update
   */
  update() {
    this.cables.forEach(cable => {
      if (cable.isActive && cable.particle) {
        cable.progress = (cable.progress + cable.speed) % 1.0;
        const point = cable.curve.getPointAt(cable.progress);
        cable.particle.position.copy(point);
      }
    });
  }

  /**
   * Clear all existing cables
   */
  clear() {
    this.cables.forEach(c => {
      if (c.mesh) this.scene.remove(c.mesh);
      if (c.particle) this.scene.remove(c.particle);
    });
    this.cables = [];
  }
}
