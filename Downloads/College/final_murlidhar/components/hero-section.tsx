"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function HeroSection() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.5)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden pt-20">
      <div
        className="absolute inset-0 bg-white"
        style={{
          backgroundImage:
            "url(/placeholder.svg?height=1080&width=1920&query=luxury furniture showroom plywood stacks)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${offset}px)`,
        }}
      >
        <div className="absolute inset-0 bg-white/70"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
        <div className="animate-slide-down space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-primary text-balance leading-tight">
            Premium Plywood & Furniture Solutions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Quality materials and elegant furniture to bring your space to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/explore"
              className="px-8 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Products
            </Link>
            <a
              href="#contact"
              className="px-8 py-3 border-2 border-primary hover:bg-primary hover:text-white text-primary font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="text-primary text-center">
          <p className="text-sm mb-2">Scroll to explore</p>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
