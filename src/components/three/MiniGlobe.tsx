'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PIN_COORDINATES } from '@/data/pin-coordinates'

const EARTH_RADIUS = 5
const PIN_HEIGHT = 0.28
const PIN_RADIUS = 0.025
const PIN_HEAD_RADIUS = 0.07
const ASIA_ROT_Y = -3.44

const atmosVert = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const atmosFrag = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`

function latLngToPos(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

function createPin(lat: number, lng: number): THREE.Group {
  const group = new THREE.Group()
  const pos = latLngToPos(lat, lng, EARTH_RADIUS)
  const normal = pos.clone().normalize()

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(PIN_RADIUS * 0.3, PIN_RADIUS, PIN_HEIGHT, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    })
  )
  stem.position.y = PIN_HEIGHT / 2
  group.add(stem)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(PIN_HEAD_RADIUS, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xdd2222,
      metalness: 0.2,
      roughness: 0.35,
      emissive: 0x991111,
      emissiveIntensity: 0.15,
    })
  )
  head.position.y = PIN_HEIGHT + PIN_HEAD_RADIUS * 0.5
  group.add(head)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(PIN_HEAD_RADIUS * 0.8, PIN_HEAD_RADIUS * 1.6, 32),
    new THREE.MeshBasicMaterial({
      color: 0xdd2222,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    })
  )
  ring.position.y = 0.005
  ring.rotation.x = -Math.PI / 2
  group.add(ring)

  group.position.copy(pos)
  group.lookAt(pos.clone().add(normal))
  group.rotateX(Math.PI / 2)
  return group
}

export default function MiniGlobe({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return

    const isMobile = w < 768
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, isMobile ? 36 : 18)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const loader = new THREE.TextureLoader()
    const earthTex = loader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
    )
    const bumpTex = loader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
    )

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earthTex,
        bumpMap: bumpTex,
        bumpScale: 0.3,
        roughness: 0.7,
        metalness: 0.1,
      })
    )
    earth.rotation.y = ASIA_ROT_Y
    earth.rotation.x = -0.26
    earth.position.y = isMobile ? -5.5 : -3.5
    earth.raycast = () => {}
    scene.add(earth)

    // Atmosphere
    earth.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: atmosVert,
          fragmentShader: atmosFrag,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
        })
      )
    )

    // Lights
    scene.add(new THREE.AmbientLight(0x404060, 1.8))
    const dir = new THREE.DirectionalLight(0xffffff, 2.5)
    dir.position.set(5, 3, 5)
    scene.add(dir)
    const back = new THREE.DirectionalLight(0x3366ff, 0.6)
    back.position.set(-5, -2, -5)
    scene.add(back)

    // Pins
    const pins: THREE.Group[] = []
    for (const coord of Object.values(PIN_COORDINATES)) {
      const pin = createPin(coord.lat, coord.lng)
      earth.add(pin)
      pins.push(pin)
    }

    // Animate
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      earth.rotation.y += 0.0012

      const t = Date.now() * 0.001
      for (const pin of pins) {
        const ring = pin.children[2] as THREE.Mesh
        if (ring?.material) {
          const m = ring.material as THREE.MeshBasicMaterial
          m.opacity = 0.06 + 0.05 * Math.sin(t * 2)
          ring.scale.setScalar(1 + 0.1 * Math.sin(t * 2))
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      if (nw === 0 || nh === 0) return
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className={`w-full h-full ${className}`} />
}
