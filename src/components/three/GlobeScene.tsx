'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { PIN_COORDINATES, type CountryId } from '@/data/pin-coordinates'
import Header from '@/components/common/Header'
import { fetchAllDriveImagesProgressive, fetchBatchImageData, type DriveImage } from '@/lib/google-drive'
import { useLanguage } from '@/lib/language-context'

// --- Distance from Japan (Haversine) ---
const JAPAN_LAT = 36.2048
const JAPAN_LNG = 138.2529
function distanceFromJapanKm(lat: number, lng: number): number {
  const R = 6371
  const dLat = (lat - JAPAN_LAT) * Math.PI / 180
  const dLng = (lng - JAPAN_LNG) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(JAPAN_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)) / 100) * 100
}

// --- Constants ---
const EARTH_RADIUS = 5
const PIN_HEIGHT = 0.28
const PIN_RADIUS = 0.025
const PIN_HEAD_RADIUS = 0.07
const ASIA_TARGET_ROT_Y = -3.44

// --- Easing ---
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}
function easeInQuad(t: number) {
  return t * t
}
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

// --- Helpers ---
function latLngToPosition(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function createPinMesh(lat: number, lng: number, id: string): THREE.Group {
  const group = new THREE.Group()
  group.userData = { pinId: id }

  const surfacePos = latLngToPosition(lat, lng, EARTH_RADIUS)
  const normal = surfacePos.clone().normalize()

  // Stem — silver metallic needle
  const stemGeo = new THREE.CylinderGeometry(PIN_RADIUS * 0.3, PIN_RADIUS, PIN_HEIGHT, 8)
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, metalness: 0.3, roughness: 0.1,
    emissive: 0xffffff, emissiveIntensity: 0.3,
  })
  const stem = new THREE.Mesh(stemGeo, stemMat)
  stem.position.set(0, PIN_HEIGHT / 2, 0)
  group.add(stem)

  // Head — classic red sphere
  const headGeo = new THREE.SphereGeometry(PIN_HEAD_RADIUS, 16, 16)
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xdd2222, metalness: 0.2, roughness: 0.35,
    emissive: 0x991111, emissiveIntensity: 0.15,
  })
  const head = new THREE.Mesh(headGeo, headMat)
  head.position.set(0, PIN_HEIGHT + PIN_HEAD_RADIUS * 0.5, 0)
  group.add(head)

  // Subtle glow ring under pin
  const ringGeo = new THREE.RingGeometry(PIN_HEAD_RADIUS * 0.8, PIN_HEAD_RADIUS * 1.6, 32)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xdd2222, transparent: true, opacity: 0.1, side: THREE.DoubleSide,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.set(0, 0.005, 0)
  ring.rotation.x = -Math.PI / 2
  group.add(ring)

  // [3] Hit area — nearly invisible but raycaster-visible
  const hitGeo = new THREE.SphereGeometry(PIN_HEAD_RADIUS * 3, 8, 8)
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0.001, depthWrite: false, side: THREE.DoubleSide,
  })
  const hitArea = new THREE.Mesh(hitGeo, hitMat)
  hitArea.position.set(0, PIN_HEIGHT * 0.5, 0)
  group.add(hitArea)

  // Position & orient
  group.position.copy(surfacePos)
  group.lookAt(surfacePos.clone().add(normal))
  group.rotateX(Math.PI / 2)

  return group
}

// --- Atmosphere shader ---
const atmosVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const atmosFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`

type SceneRefs = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  earth: THREE.Mesh
  pinGroups: Map<CountryId, THREE.Group>
  autoRotate: boolean
  isZooming: boolean
  animationId: number
  selectedPinId: CountryId | null
}

// --- Photo burst ---
function PhotoBurst({
  selectedPin,
  pinImages,
}: {
  selectedPin: CountryId
  pinImages: { url: string; permalink: string }[]
}) {
  const { lang } = useLanguage()

  // ピンが変わるたびにランダムに20枚抽出（keyでremountされるので毎回実行）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [images] = useState(() => {
    const shuffled = [...pinImages].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, isMobile ? 20 : 15)
  })
  const [albumOpen, setAlbumOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => prev !== null ? Math.min(prev + 1, pinImages.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => prev !== null ? Math.max(prev - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, pinImages.length])

  return (
    <>
      {/* Country name — between header and globe */}
      {!albumOpen && (
        <div
          className="absolute left-0 right-0 z-[15] flex justify-center pointer-events-none"
          style={{ top: '22%', animation: 'fadeSlideIn 0.5s ease-out both' }}
        >
          <div className="flex flex-col items-center gap-0.5 bg-black/40 backdrop-blur-md rounded-2xl px-6 py-2.5 border border-white/15">
            <span className="text-white font-bold text-[clamp(1.1rem,2.2vw,1.6rem)] tracking-[0.2em] uppercase">
              📍 {PIN_COORDINATES[selectedPin].label.toUpperCase()}
            </span>
            {selectedPin !== 'japan' && (
              <span className="text-white/75 text-[clamp(0.65rem,1vw,0.8rem)] tracking-[0.1em]">
                {{ ja: '日本から約', en: 'approx.', zh: '距日本约' }[lang]} {distanceFromJapanKm(PIN_COORDINATES[selectedPin].lat, PIN_COORDINATES[selectedPin].lng).toLocaleString()} {{ ja: 'km', en: 'km from Japan', zh: 'km' }[lang]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Background photo grid behind globe */}
      {!albumOpen && (
        <div className="absolute top-14 md:top-[4.5rem] left-0 right-0 bottom-0 z-0 grid grid-cols-4 md:grid-cols-5 auto-rows-fr">
          {images.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden pointer-events-none"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 0, transition: `opacity 0.5s ease-out ${i * 0.04}s` }}
                onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* もっと見る button */}
      {!albumOpen && pinImages.length > 0 && (
        <button
          onClick={() => setAlbumOpen(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-[#e2e8f0] cursor-pointer hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.18)] transition-all duration-200"
          style={{ animation: 'fadeSlideIn 0.4s ease-out 0.8s both' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748b]">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="text-[0.82rem] font-semibold text-[#0f172a] tracking-[0.04em]">
            {{ ja: `もっと見る (${pinImages.length}枚)`, en: `View all (${pinImages.length} photos)`, zh: `查看全部 (${pinImages.length}张)` }[lang]}
          </span>
        </button>
      )}

      {/* Album modal */}
      {albumOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#f8fafc]/95 backdrop-blur-md" style={{ animation: 'fadeSlideIn 0.3s ease-out both' }}>
          {/* Album header */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-[#e2e8f0]">
            <div>
              <h2 className="text-lg md:text-xl font-semibold tracking-[0.1em] text-[#0f172a]">
                {PIN_COORDINATES[selectedPin].labelJa}
              </h2>
              <p className="text-[0.75rem] md:text-[0.8rem] text-[#64748b] tracking-[0.06em]">
                {PIN_COORDINATES[selectedPin].label} — {{ ja: `${pinImages.length}枚`, en: `${pinImages.length} photos`, zh: `${pinImages.length}张` }[lang]}
              </p>
            </div>
            <button
              onClick={() => setAlbumOpen(false)}
              className="flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-5 py-2 md:py-2.5 bg-white border border-[#e2e8f0] shadow-sm cursor-pointer hover:bg-[#f1f5f9] transition-colors duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#64748b]">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="text-[0.75rem] md:text-[0.8rem] font-medium text-[#475569]">{{ ja: '閉じる', en: 'Close', zh: '关闭' }[lang]}</span>
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6">
            <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 md:gap-4 max-w-[1400px] mx-auto">
              {pinImages.map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.1)] border border-[#e2e8f0] bg-white hover:shadow-[0_8px_28px_rgba(15,23,42,0.16)] hover:scale-[1.03] transition-all duration-200 cursor-pointer"
                  style={{ animation: `fadeSlideIn 0.35s ease-out ${Math.min(i * 0.03, 1)}s both` }}
                  onClick={() => setLightboxIndex(i)}
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && pinImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          {/* Image */}
          <img
            src={pinImages[lightboxIndex].url}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {lightboxIndex < pinImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-3 right-3 md:top-5 md:right-5 w-10 h-10 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {pinImages.length}
          </div>
        </div>
      )}
    </>
  )
}

// --- Random global photos (no pin selected) ---
function RandomGlobalPhotos({ driveImages }: { driveImages: Record<string, DriveImage[]> }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [picked] = useState(() => {
    const all: DriveImage[] = []
    for (const imgs of Object.values(driveImages)) {
      for (const img of imgs) all.push(img)
    }
    return all.sort(() => Math.random() - 0.5).slice(0, isMobile ? 12 : 15)
  })

  const [dataUris, setDataUris] = useState<Record<string, string> | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (picked.length === 0) return
    let cancelled = false
    fetchBatchImageData(picked.map((img) => img.id)).then((data) => {
      if (cancelled) return
      setDataUris(data)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    })
    return () => { cancelled = true }
  }, [picked])

  if (picked.length === 0 || !dataUris) return null

  return (
    <div className="absolute top-14 md:top-[4.5rem] left-0 right-0 bottom-0 z-0 grid grid-cols-4 md:grid-cols-5 auto-rows-fr">
      {picked.map((img, i) => {
        const src = dataUris[img.id]
        if (!src) return <div key={i} className="overflow-hidden pointer-events-none" />
        return (
          <div key={i} className="overflow-hidden pointer-events-none">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.5s ease-out ${i * 0.04}s`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function GlobeScene() {
  const { lang } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneRefs | null>(null)
  const [phase, setPhase] = useState<'idle' | 'zooming' | 'interactive'>('idle')
  const [headerVisible, setHeaderVisible] = useState(false)
  const [selectedPin, setSelectedPin] = useState<CountryId | null>(null)
  const [textOpacity, setTextOpacity] = useState(1)
  const [showClickHint, setShowClickHint] = useState(false)
  const [driveImages, setDriveImages] = useState<Record<string, DriveImage[]>>({})
  const [driveLoading, setDriveLoading] = useState(false)
  const [allImagesLoaded, setAllImagesLoaded] = useState(false)
  // Mirror of which countries have a Drive folder — used from non-React
  // code (drop animation, raycaster) which shouldn't see stale state.
  const folderCountriesRef = useRef<Set<string>>(new Set())

  // --- Init ---
  const initScene = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    // No scene.background — alpha renderer on white page

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    const isMobileInit = w < 768
    camera.position.set(0, 0, isMobileInit ? 14 : 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.8
    controls.minDistance = 7
    controls.maxDistance = 40
    controls.enablePan = false

    // Earth — Blue Marble (same as output/index.html)
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
    )
    const bumpTexture = textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
    )
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64)
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.3,
      roughness: 0.7,
      metalness: 0.1,
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    // Disable raycast on earth sphere so it doesn't block pin clicks
    earth.raycast = () => {}
    scene.add(earth)

    // Atmosphere
    const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64)
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: atmosVertexShader,
      fragmentShader: atmosFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat)
    earth.add(atmosphere)

    // Lights — matching output/index.html
    scene.add(new THREE.AmbientLight(0x606880, 2.4))
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.2)
    dirLight.position.set(5, 3, 5)
    scene.add(dirLight)
    const backLight = new THREE.DirectionalLight(0x3366ff, 0.6)
    backLight.position.set(-5, -2, -5)
    scene.add(backLight)

    // Pins — added as children of earth so they rotate with it
    const pinGroups = new Map<CountryId, THREE.Group>()
    for (const [id, coord] of Object.entries(PIN_COORDINATES)) {
      const pin = createPinMesh(coord.lat, coord.lng, id)
      pin.visible = false // hidden until zoom completes
      earth.add(pin)
      pinGroups.set(id as CountryId, pin)
    }

    // Animation
    const refs: SceneRefs = {
      scene,
      camera,
      renderer,
      controls,
      earth,
      pinGroups,
      autoRotate: true,
      isZooming: false,
      animationId: 0,
      selectedPinId: null,
    }
    sceneRef.current = refs

    const animate = () => {
      refs.animationId = requestAnimationFrame(animate)

      if (refs.autoRotate && !refs.isZooming) {
        earth.rotation.y += 0.0008
      }

      // Pin glow pulse + selected pin highlight
      const time = Date.now() * 0.001
      const currentSelected = refs.selectedPinId
      pinGroups.forEach((group, pinId) => {
        if (!group.visible) return
        const isSelected = pinId === currentSelected
        const ring = group.children[2] as THREE.Mesh
        const head = group.children[1] as THREE.Mesh
        const stem = group.children[0] as THREE.Mesh

        if (isSelected) {
          if (ring?.material) { const m = ring.material as THREE.MeshBasicMaterial; m.opacity = 0.3 + 0.15 * Math.sin(time * 4); m.color.setHex(0xffdd44); ring.scale.setScalar(1.8 + 0.4 * Math.sin(time * 4)) }
          if (head?.material) { const m = head.material as THREE.MeshStandardMaterial; m.emissive.setHex(0xffaa00); m.emissiveIntensity = 0.8 + 0.3 * Math.sin(time * 4) }
          if (stem?.material) { const m = stem.material as THREE.MeshStandardMaterial; m.emissiveIntensity = 0.6 + 0.2 * Math.sin(time * 4) }
        } else {
          if (ring?.material) { const m = ring.material as THREE.MeshBasicMaterial; m.opacity = 0.06 + 0.05 * Math.sin(time * 2); m.color.setHex(0xdd2222); ring.scale.setScalar(1 + 0.1 * Math.sin(time * 2)) }
          if (head?.material) { const m = head.material as THREE.MeshStandardMaterial; m.emissive.setHex(0x991111); m.emissiveIntensity = 0.15 }
          if (stem?.material) { const m = stem.material as THREE.MeshStandardMaterial; m.emissiveIntensity = 0.3 }
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(refs.animationId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    const cleanup = initScene()
    return cleanup
  }, [initScene])

  // Sync selectedPin to sceneRef for animation loop
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.selectedPinId = selectedPin
    }
  }, [selectedPin])

  // --- GO ASIA! click ---
  const handleGoAsia = useCallback(() => {
    const refs = sceneRef.current
    if (!refs || phase !== 'idle') return
    setPhase('zooming')
    refs.isZooming = true
    refs.autoRotate = false
    refs.controls.enabled = false

    const { camera, earth, pinGroups } = refs

    const startEarthRotY = earth.rotation.y
    const startCamPos = camera.position.clone() // (0, 0, 9)
    const isMobileView = window.innerWidth < 768
    const endCamPos = new THREE.Vector3(0, -2, isMobileView ? 26 : 25)

    // Target rotation (shortest path to Asia)
    let deltaRotY = ASIA_TARGET_ROT_Y - (startEarthRotY % (2 * Math.PI))
    while (deltaRotY > Math.PI) deltaRotY -= 2 * Math.PI
    while (deltaRotY < -Math.PI) deltaRotY += 2 * Math.PI

    // Phase 1: Rotate to Asia + sink down + pull back (2.5s)
    const PHASE1_DURATION = 2500
    // Phase 2: Tilt up so equator is at screen bottom (1.5s)
    const PHASE2_DURATION = 1500
    const targetTiltX = -0.26 // tilt earth so lat -11° is at screen edge

    const startTime = Date.now()

    const phase1Animate = () => {
      const elapsed = Date.now() - startTime
      const rawT = Math.min(elapsed / PHASE1_DURATION, 1)

      // Text fade out (0-15%)
      const textT = Math.min(rawT / 0.15, 1)
      setTextOpacity(1 - easeInOutSine(textT))

      // Header fade in (30%+)
      if (rawT > 0.3) {
        setHeaderVisible(true)
      }

      const rotT = easeInOutQuart(rawT)

      // Earth: rotate to Asia + sink down
      earth.rotation.y = startEarthRotY + deltaRotY * rotT
      earth.position.y = (isMobileView ? -3.5 : -3.5) * rotT

      // Camera: pull back
      camera.position.lerpVectors(startCamPos, endCamPos, rotT)
      camera.lookAt(0, 0, 0)
      refs.controls.target.set(0, 0, 0)

      if (rawT < 1) {
        requestAnimationFrame(phase1Animate)
      } else {
        // Phase 2: tilt earth upward
        const phase2Start = Date.now()
        const startRotX = earth.rotation.x
        const phase2CamStart = camera.position.clone()
        const phase2CamEnd = new THREE.Vector3(0, -2, isMobileView ? 26 : 18)

        const phase2Animate = () => {
          const dt = Math.min((Date.now() - phase2Start) / PHASE2_DURATION, 1)
          const t = easeInOutQuart(dt)

          earth.rotation.x = startRotX + targetTiltX * t
          camera.position.lerpVectors(phase2CamStart, phase2CamEnd, t)
          camera.lookAt(0, 0, 0)

          if (dt < 1) {
            requestAnimationFrame(phase2Animate)
          } else {
            // Phase 2 done — enable controls
            refs.controls.target.set(0, 0, 0)
            refs.controls.enabled = true

            // Only drop pins for countries whose Drive folder is known
            // at the time the zoom completes. Folders that load later are
            // revealed without animation via the `driveImages` effect.
            const pinEntries = Array.from(pinGroups.entries()).filter(
              ([id]) => folderCountriesRef.current.has(id)
            )
            let idx = 0

            const dropNextPin = () => {
              if (idx < pinEntries.length) {
                const [, group] = pinEntries[idx]
                group.visible = true

                group.children.forEach((child) => {
                  child.scale.set(0.01, 0.01, 0.01)
                })

                const dropStart = Date.now()
                const DROP_DURATION = 420
                const animateDrop = () => {
                  const dt2 = Math.min((Date.now() - dropStart) / DROP_DURATION, 1)
                  const eased = dt2 < 0.7
                    ? easeInQuad(dt2 / 0.7) * 1.3
                    : 1.3 - 0.3 * easeInOutSine((dt2 - 0.7) / 0.3)
                  const s = Math.min(eased, 1.15)
                  group.children.forEach((child) => {
                    child.scale.set(s, s, s)
                  })
                  if (dt2 < 1) {
                    requestAnimationFrame(animateDrop)
                  } else {
                    group.children.forEach((child) => {
                      child.scale.set(1, 1, 1)
                    })
                  }
                }
                animateDrop()

                idx++
                setTimeout(dropNextPin, 70)
              } else {
                setPhase('interactive')
                setShowClickHint(true)
                setTimeout(() => setShowClickHint(false), 4000)
              }
            }
            dropNextPin()
          }
        }
        phase2Animate()
      }
    }

    phase1Animate()
  }, [phase])

  // --- Raycaster for pin clicks ---
  useEffect(() => {
    if (phase !== 'interactive') return
    const refs = sceneRef.current
    if (!refs) return

    const { renderer, camera, earth } = refs
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // Build a set of earth mesh UUIDs to exclude from pin hits
    const earthMeshUUIDs = new Set<string>()
    earth.traverse((obj) => {
      if (obj === earth) earthMeshUUIDs.add(obj.uuid)
    })
    // Also exclude atmosphere etc — only pin groups' children are valid
    const pinChildUUIDs = new Set<string>()
    refs.pinGroups.forEach((group) => {
      group.traverse((obj) => {
        pinChildUUIDs.add(obj.uuid)
      })
    })

    const findPinFromRay = (mx: number, my: number): string | null => {
      mouse.x = mx
      mouse.y = my
      raycaster.setFromCamera(mouse, camera)

      // Raycast against earth recursively (includes pin children)
      const intersects = raycaster.intersectObject(earth, true)

      // Filter to only pin children
      const pinHits: { id: string; distance: number }[] = []
      for (const hit of intersects) {
        if (!pinChildUUIDs.has(hit.object.uuid)) continue
        // Walk up to find the pin group
        let obj: THREE.Object3D | null = hit.object
        while (obj) {
          if (obj.userData?.pinId) {
            pinHits.push({ id: obj.userData.pinId, distance: hit.distance })
            break
          }
          obj = obj.parent
        }
      }

      if (pinHits.length === 0) return null

      // Pick closest
      pinHits.sort((a, b) => a.distance - b.distance)
      return pinHits[0].id
    }

    // Use pointerdown/pointerup to detect clicks (avoids OrbitControls eating click events)
    let pointerDownPos = { x: 0, y: 0 }

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = (e: PointerEvent) => {
      // Only treat as click if pointer didn't move much (not a drag)
      const dx = e.clientX - pointerDownPos.x
      const dy = e.clientY - pointerDownPos.y
      if (dx * dx + dy * dy > 25) return // moved more than 5px = drag, not click

      const rect = renderer.domElement.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const pinId = findPinFromRay(mx, my)
      if (pinId) {
        setSelectedPin((prev) => (prev === pinId ? null : (pinId as CountryId)))
      } else {
        setSelectedPin(null)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const pinId = findPinFromRay(mx, my)
      renderer.domElement.style.cursor = pinId ? 'pointer' : 'grab'
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    return () => {
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
    }
  }, [phase])

  // --- Fetch Google Drive images progressively ---
  useEffect(() => {
    setDriveLoading(true)
    fetchAllDriveImagesProgressive((images) => {
      setDriveImages(images)
      setDriveLoading(false)
    })
      .then(() => setAllImagesLoaded(true))
      .catch(() => setDriveLoading(false))
  }, [])

  // --- Sync pin visibility with Drive folders ---
  // Only pins whose country folder exists in Drive are shown.
  // Pins that become known after the intro drop animation are revealed
  // without animation.
  useEffect(() => {
    folderCountriesRef.current = new Set(Object.keys(driveImages))
    const refs = sceneRef.current
    if (!refs) return
    if (phase !== 'interactive') return
    refs.pinGroups.forEach((group, pinId) => {
      group.visible = folderCountriesRef.current.has(pinId)
    })
  }, [driveImages, phase])

  // Get images for selected pin
  const driveImgs = selectedPin ? (driveImages[selectedPin] || []) : []
  const pinImages = driveImgs.map((d) => ({ url: d.url, permalink: '' }))

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-10" />

      {/* Click hint — appears after pins are placed */}
      {showClickHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.1)] border border-[#e2e8f0] animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#dd2222]">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/>
          </svg>
          <span className="text-[0.82rem] font-semibold text-[#0f172a] tracking-[0.04em]">
            {{ ja: 'ピンをクリックして活動写真を見る', en: 'Click a pin to see activity photos', zh: '点击图钉查看活动照片' }[lang]}
          </span>
        </div>
      )}

      {/* Header — fades in during zoom */}
      <div className={`transition-opacity duration-[2000ms] ease-out ${headerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Header />
      </div>

      {/* Title + GO ASIA! — hidden completely after fade out */}
      {phase === 'idle' && (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none gap-8"
        style={{ opacity: textOpacity, transition: 'none' }}
      >
        <p className="text-[clamp(0.45rem,1vw,0.72rem)] tracking-[0.5em] uppercase text-[rgba(255,255,255,0.5)] font-normal">
          Global Entrepreneurship Lab
        </p>
        <button
          onClick={handleGoAsia}
          className="pointer-events-auto text-[clamp(2.2rem,10vw,7rem)] font-bold tracking-[0.22em] uppercase text-[#f8fafc] bg-transparent border-none cursor-pointer px-5 py-2 transition-all duration-300 hover:tracking-[0.28em] hover:[text-shadow:0_0_80px_rgba(41,151,255,0.5)] active:translate-y-px"
          style={{
            textShadow: '0 0 60px rgba(41, 151, 255, 0.3)',
            fontFamily: 'inherit',
          }}
        >
          GO ASIA!
        </button>
        <p className="text-[clamp(0.5rem,0.8vw,0.65rem)] tracking-[0.35em] uppercase text-[rgba(255,255,255,0.4)] font-light">
          Musashino University · Faculty of Entrepreneurship · Tsubuki Seminar
        </p>
      </div>
      )}

      {/* Random global photos — shown after animation, before pin selection */}
      {phase === 'interactive' && !selectedPin && Object.keys(driveImages).length > 0 && (
        <RandomGlobalPhotos
          key={allImagesLoaded ? 'all' : 'initial'}
          driveImages={driveImages}
        />
      )}

      {/* Photos burst around globe — wait for data load, key on selectedPin to force remount */}
      {selectedPin && !driveLoading && (
        <PhotoBurst
          key={selectedPin}
          selectedPin={selectedPin}
          pinImages={pinImages}
        />
      )}

    </div>
  )
}
