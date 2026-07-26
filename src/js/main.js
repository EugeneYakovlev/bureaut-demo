import '../css/style.css'
import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { initScaleOnScroll } from './assets/scale.js'
import { initParallaxOnScroll } from './assets/parallax.js'
import { initHoverDistortion } from './assets/hoverDistort.js'
import StickyGridScroll from './assets/stickyGrid.js'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1.4
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  initScaleOnScroll()
  initParallaxOnScroll()
  initHoverDistortion()
  
  new StickyGridScroll()
})
