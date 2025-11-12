"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AboutSection() {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      })
    })

    const section = document.getElementById("about")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className={`rounded-lg overflow-hidden shadow-lg h-96 ${isInView ? "animate-slide-up" : "opacity-0"}`}>
            <img
              src="murlidhar.webp"
              alt="Murlidhar Showroom"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div
            className={`space-y-6 ${isInView ? "animate-slide-up" : "opacity-0"}`}
            style={isInView ? { animationDelay: "100ms" } : {}}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Murlidhar Ply & Hardware</h2>
            <div className="w-16 h-1 bg-primary mb-6"></div>

            <p className="text-muted-foreground leading-relaxed">
              Murlidhar Ply & Hardware is a family-owned business established in Kapadvanj, serving the community with
              premium quality materials and elegant furniture solutions for over two decades.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              We provide quality materials and furniture to homes, carpenters, and designers across Gujarat. Our
              commitment to excellence and customer satisfaction makes us a trusted name in the plywood and hardware
              industry.
            </p>

            <div className="pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-foreground">Premium quality plywood and laminates</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-foreground">Curated furniture and interior solutions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-foreground">Complete hardware and accessories range</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-foreground">Trusted by carpenters and designers</span>
              </div>
            </div>

            <Link
              href="/learn-more"
              className="inline-block mt-4 px-6 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
