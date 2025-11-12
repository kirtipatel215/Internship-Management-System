"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function ExplorePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const categories = [
    {
      id: 1,
      title: "Premium Plywood",
      description: "High-quality plywood for residential and commercial projects",
      details:
        "Our premium plywood collection features superior durability and finish. Perfect for furniture making, interior design, and structural applications.",
      image: "premium-plywood-texture.jpg",
      features: ["Marine Grade", "Weather Resistant", "Long Lasting", "Eco-Friendly"],
    },
    {
      id: 2,
      title: "Modern Furniture",
      description: "Contemporary furniture designs for every space",
      details:
        "Handcrafted furniture pieces combining aesthetic appeal with functionality. Each piece is designed to enhance your living spaces.",
      image: "/modern-furniture.png",
      features: ["Custom Designs", "Premium Materials", "Expert Craftsmanship", "Timeless Style"],
    },
    {
      id: 3,
      title: "Hardware Solutions",
      description: "Complete hardware and fixtures for all your needs",
      details:
        "From basic hardware to decorative fixtures, we provide comprehensive solutions for residential, commercial, and industrial applications.",
      image: "/hardware-fixtures.jpg",
      features: ["Wide Selection", "Durability", "Affordable Prices", "Professional Grade"],
    },
    {
      id: 4,
      title: "Interior Designs",
      description: "Custom interior solutions tailored to your style",
      details:
        "Our design team creates personalized interior solutions that reflect your taste and maximize your space efficiently.",
      image: "/interior-design-home.jpg",
      features: ["Design Consultation", "Custom Solutions", "Quality Materials", "Fast Execution"],
    },
  ]

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-16 md:pb-24 bg-gradient-to-b from-white to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Explore Our Collection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our comprehensive range of premium plywood, furniture, and hardware solutions designed for modern
              living
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{
                  opacity: 1 - scrollY * 0.0001,
                  transform: `translateY(${scrollY * 0.05}px)`,
                }}
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <p className="text-foreground text-sm mb-6">{category.details}</p>
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-primary mb-2">Key Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {category.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/learn-more"
                    className="inline-block px-6 py-2 bg-primary hover:bg-accent text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
