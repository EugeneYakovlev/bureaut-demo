import { gsap } from 'gsap'

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max)

export function initParallaxOnScroll(selector = '[data-scroll]') {
  gsap.utils.toArray(selector).forEach((el) => {
    const speed = parseFloat(el.dataset.scroll ?? 0)
    const distance = speed * window.innerHeight * 0.1
    const lerp = el.dataset.scrollLerp

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const restProgress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))

    gsap.fromTo(
      el,
      { y: -restProgress * distance },
      {
        y: (1 - restProgress) * distance,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: lerp !== undefined ? parseFloat(lerp) : true,
        },
      }
    )
  })
}
