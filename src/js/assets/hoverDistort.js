import * as THREE from 'three'
import { gsap } from 'gsap'
import displacementUrl from '../../assets/displacement2.jpg?url'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform sampler2D uDisplacement;
  uniform float uProgress;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    vec4 disp = texture2D(uDisplacement, uv);

    vec2 distortedPosition = vec2(uv.x + uProgress * (disp.r * uStrength), uv.y);
    vec2 distortedPosition2 = vec2(uv.x - (1.0 - uProgress) * (disp.r * uStrength), uv.y);


    vec4 from = texture2D(uFrom, distortedPosition);
    vec4 to = texture2D(uTo, distortedPosition2);

    gl_FragColor = mix(from, to, uProgress);
  }
`

let sharedDisplacementTexture = null
function getDisplacementTexture(loader) {
  if (!sharedDisplacementTexture) {
    sharedDisplacementTexture = loader.load(displacementUrl)
    sharedDisplacementTexture.wrapS = THREE.RepeatWrapping
    sharedDisplacementTexture.wrapT = THREE.RepeatWrapping
  }
  return sharedDisplacementTexture
}

export function initHoverDistortion(selector = '[data-hover-distort]') {
  const elements = gsap.utils.toArray(selector)
  if (elements.length === 0) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:20;'
  document.body.appendChild(canvas)

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch {
    canvas.remove()
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 1000)
  camera.position.z = 10
  const textureLoader = new THREE.TextureLoader()
  const displacementTexture = getDisplacementTexture(textureLoader)

  const items = elements.map((el) => {
    const img = el.querySelector('img:not([data-hover-to])')
    const fromUrl = img.getAttribute('src')
    const toUrl = el.querySelector('[data-hover-to]').getAttribute('src')
    const strength = parseFloat(el.dataset.hoverStrength ?? 0.55)
    const lerp = parseFloat(el.dataset.hoverLerp ?? 0.05)

    const uniforms = {
      uFrom: { value: null },
      uTo: { value: null },
      uDisplacement: { value: displacementTexture },
      uProgress: { value: 0 },
      uStrength: { value: strength },
    }

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
    mesh.visible = false
    scene.add(mesh)

    let loadedCount = 0
    const onTextureLoaded = () => {
      loadedCount += 1
      if (loadedCount === 2) {
        img.style.visibility = 'hidden'
        mesh.visible = true
      }
    }

    textureLoader.load(
      fromUrl,
      (texture) => {
        uniforms.uFrom.value = texture
        onTextureLoaded()
      },
      undefined,
      (error) => console.error(`hoverDistort: failed to load "from" texture ${fromUrl}`, error)
    )
    textureLoader.load(
      toUrl,
      (texture) => {
        uniforms.uTo.value = texture
        onTextureLoaded()
      },
      undefined,
      (error) => console.error(`hoverDistort: failed to load "to" texture ${toUrl}`, error)
    )

    const state = { target: 0, lerp }
    el.addEventListener('pointerenter', () => {
      state.target = 1
    })
    el.addEventListener('pointerleave', () => {
      state.target = 0
    })

    mesh.onBeforeRender = (rendererArg) => {
      const clipRect = el.getBoundingClientRect()
      const pixelRatio = rendererArg.getPixelRatio()
      rendererArg.setScissorTest(true)
      rendererArg.setScissor(
        clipRect.left * pixelRatio,
        (window.innerHeight - clipRect.bottom) * pixelRatio,
        clipRect.width * pixelRatio,
        clipRect.height * pixelRatio
      )
    }
    mesh.onAfterRender = (rendererArg) => {
      rendererArg.setScissorTest(false)
    }

    return { el, img, mesh, uniforms, state }
  })

  function resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    renderer.setSize(width, height)
    camera.left = 0
    camera.right = width
    camera.top = height
    camera.bottom = 0
    camera.updateProjectionMatrix()
  }

  function updatePositions() {
    const height = window.innerHeight
    for (const { img, mesh } of items) {
      const rect = img.getBoundingClientRect()
      
      mesh.position.set(rect.left + rect.width / 2, height - (rect.top + rect.height / 2), 0)
      mesh.scale.set(rect.width, rect.height, 1)
    }
  }

  window.addEventListener('resize', resize)
  resize()

  gsap.ticker.add(() => {
    updatePositions()
    for (const { uniforms, state } of items) {
      uniforms.uProgress.value = THREE.MathUtils.lerp(uniforms.uProgress.value, state.target, state.lerp)
    }
    renderer.render(scene, camera)
  })
}
