import '../css/style.css'
import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { initScaleOnScroll } from './assets/scale.js'
import { initParallaxOnScroll } from './assets/parallax.js'

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis()

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  initScaleOnScroll()
  initParallaxOnScroll()
})
