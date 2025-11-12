"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function HeroSection() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.3) // subtle parallax
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden pt-20">
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 bg-gray-100"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.8)), url(/placeholder.svg?height=1080&width=1920&query=luxury furniture)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s ease-out",
        }}
      ></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 md:px-12">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-wide">
            Murlidhar Ply & Hardware
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-700 font-medium">
            Crafting Elegant Spaces with Premium Furniture
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Discover high-quality plywood and bespoke furniture that combines luxury, functionality, and timeless design. 
            Quality materials, expert craftsmanship, and furniture that transforms your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/explore"
              className="px-10 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Collection
            </Link>
            <a
              href="#contact"
              className="px-10 py-3 border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Request a Consultation
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="text-gray-900 text-center">
          <p className="text-sm mb-1">Scroll down</p>
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
