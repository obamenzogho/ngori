'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
      baseX: number
      baseY: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.baseX = this.x
        this.baseY = this.y
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `hsla(${Math.random() * 60 + 260}, 100%, 75%, `
        this.opacity = Math.random() * 0.5 + 0.1
      }

      update(canvasWidth: number, canvasHeight: number) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 200

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * force * 2
          this.y -= Math.sin(angle) * force * 2
        } else {
          this.x += this.speedX
          this.y += this.speedY
          if (Math.abs(this.x - this.baseX) > 50 || Math.abs(this.y - this.baseY) > 50) {
            this.speedX *= -1
            this.speedY *= -1
          }
        }

        if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1
        if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `${this.color}${this.opacity})`
        ctx.fill()
      }
    }

    const initParticles = () => {
      if (!canvas) return
      particles = []
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 100)
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height))
      }
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            if (!ctx) continue
            ctx.beginPath()
            ctx.strokeStyle = `rgba(138, 43, 226, ${0.12 - distance / 1250})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#030014')
      gradient.addColorStop(0.5, '#1c0a3b')
      gradient.addColorStop(1, '#030014')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300)
        mouseGlow.addColorStop(0, 'rgba(157, 78, 221, 0.25)')
        mouseGlow.addColorStop(0.5, 'rgba(138, 43, 226, 0.08)')
        mouseGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = mouseGlow
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height)
        particle.draw()
      })
      connectParticles()

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #030014 0%, #1c0a3b 50%, #030014 100%)' }}
    />
  )
}
