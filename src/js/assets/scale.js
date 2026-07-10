import { gsap } from 'gsap'

export function initScaleOnScroll(selector = '[data-scale-scroll]') {
  gsap.utils.toArray(selector).forEach((el) => {
    const min = parseFloat(el.dataset.scaleMin ?? 1)
    const max = parseFloat(el.dataset.scaleMax ?? 1.25)

    gsap.fromTo(
      el,
      { scale: min },
      {
        scale: max,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    )
  })
}
