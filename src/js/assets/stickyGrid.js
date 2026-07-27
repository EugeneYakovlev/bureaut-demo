import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

class StickyGridScroll {
  constructor() {
    this.getElements()

    this.initContent()
    this.groupItemsByColumn()

    this.pinSection()
    this.addParallaxOnScroll()
    this.animateTitleOnScroll()
    this.animateGridOnScroll()
  }

  getElements() {
    this.section = document.querySelector(".section--interactive")
    
    if (this.section) {
      this.wrapper = this.section.querySelector(".section__wrapper")
      this.content = this.section.querySelector(".content")
      this.title = this.section.querySelector(".content__title")
      this.description = this.section.querySelector(".content__description")
      this.button = this.section.querySelector(".content__button")
      this.grid = this.section.querySelector(".gallery__grid")
      this.items = this.section.querySelectorAll(".gallery__item")
    }
  }

  initContent() {
    if (this.description) {
      gsap.set(this.description, { 
        opacity: 0, 
        pointerEvents: "none" 
      })

      gsap.set(this.title, { 
        y: this.description.offsetHeight / 2 - 16
      })
    }

    if (this.content && this.title) {
      const dy = (this.content.offsetHeight - this.title.offsetHeight) / 2
      this.titleOffsetY = (dy / this.content.offsetHeight) * 100

      gsap.set(this.title, { yPercent: this.titleOffsetY })
    } 
  }

  pinSection() {
    if (!this.section || !this.wrapper) {
      return
    }

    ScrollTrigger.create({
      trigger: this.section,
      start: "top top",
      end: "bottom bottom",
      pin: this.wrapper,
      pinSpacing: false,
    })
  }

  groupItemsByColumn() {
    this.numColumns = 3

    this.columns = Array.from({ length: this.numColumns }, () => [])

    this.items.forEach((item, index) => {
        this.columns[index % this.numColumns].push(item)
    })
  }

  animateGridOnScroll() {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: "top 25%", 
        end: "bottom top",
        scrub: true
      },
    })
    
    timeline
      .add(this.gridRevealTimeline())
      .add(this.gridZoomTimeline(), "-=0.3")
      .add(() => this.toggleContent(timeline.scrollTrigger.direction === 1), "-=0.2")
      .add(this.gridHideTimeline())
  }

  gridRevealTimeline(columns = this.columns) {
    const timeline = gsap.timeline()
    const wh = window.innerHeight
    
    const dy = wh - (wh - this.grid.offsetHeight) / 2
    
    columns.forEach((column, colIndex) => {
      
      const fromTop = colIndex % 2 === 0
      
      timeline.from(column, {
        y: dy * (fromTop ? 1 : -1), 
        stagger: {
            each: 0.06,
            from: fromTop ? "start" : "end", 
        },
        ease: "power1.inOut",
      }, "grid-reveal") 

      timeline.eventCallback("onUpdate", () => {
        const isPastThreshold = timeline.progress() >= 0.5
        this.content.style.zIndex = isPastThreshold ? 10 : -10
      })
    })
    
    return timeline
  }

  gridHideTimeline(columns = this.columns) {
    const timeline = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } })
    
    timeline.to(this.grid, { scale: 5 })
    
    timeline.to(columns[0], { xPercent: -80, yPercent: -200, opacity: 0 }, "<") 
    timeline.to(columns[2], { xPercent: 80, yPercent: 200, opacity: 0 }, "<") 
    
    timeline.to(columns[1], {
      yPercent: (index) => (index < Math.floor(columns[1].length / 2) ? -1 : 1) * 80,
      duration: 0.25,
      opacity: 0,
      ease: "power1.inOut"
    }, "-=0.6")
    
    return timeline
  }

  gridZoomTimeline(columns = this.columns) {
    const timeline = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } })
    
    timeline.to(this.grid, { scale: 1.75 })
    
    timeline.to(columns[0], { xPercent: -40 }, "<") 
    timeline.to(columns[2], { xPercent: 40 }, "<") 
    
    timeline.to(columns[1], {
      yPercent: (index) => (index < Math.floor(columns[1].length / 2) ? -1 : 1) * 40,
      duration: 0.75,
      ease: "power1.inOut"
    }, "-=0.5")
    
    return timeline
  }

  addParallaxOnScroll() {
    if (!this.section || !this.wrapper) {
      return
    }
    
    gsap.from(this.wrapper, {
      yPercent: -100,
      ease: "none",
      scrollTrigger: {
        trigger: this.section,
        start: "top bottom",
        end: "top top",
        scrub: true
      }
    })
  }

  animateTitleOnScroll() {
    if (!this.section || !this.title) {
      return
    }
    
    gsap.from(this.title, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: this.section,
        start: "top 55%", 
        toggleActions: "play none none reverse"
      },
    })
  }

  toggleContent(isVisible = true) {
    if (!this.title || !this.description) {
      return
    }
    
    gsap.timeline({ defaults: { overwrite: true } })
      .to(this.title, {
        yPercent: isVisible ? -32 : this.titleOffsetY,
        duration: 0.5,
        ease: "power2.inOut",
      })
      .to(this.description, {
        opacity: isVisible ? 1 : 0,
        duration: 0.3,
        ease: `power1.${isVisible ? "inOut" : "out"}`,
        pointerEvents: isVisible ? "all" : "none",
      }, isVisible ? "-=90%" : "<")
  }
  
}

export default StickyGridScroll