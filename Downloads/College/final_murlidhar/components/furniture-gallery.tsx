"use client"

import { useEffect, useState } from "react"

const furnitureItems = [
  {
    id: 1,
    name: "Modern Dining Set",
    image: "/dinningset.jpg",
  },
  {
    id: 2,
    name: "Executive Desk",
    image: "desk.jpg",
  },
  {
    id: 3,
    name: "Bedroom Collection",
    image: "bedroom.jpg",
  },
  {
    id: 4,
    name: "Living Room Sofa",
    image: "sofa.jpg",
  },
  {
    id: 5,
    name: "Kitchen Cabinets",
    image: "/kitchen.jpg",
  },
  {
    id: 6,
    name: "Custom Shelving",
    image: "shelves.jpg",
  },
]

export default function FurnitureGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      })
    })

    const section = document.getElementById("furniture")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="furniture" className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className={`text-center mb-12 md:mb-16 ${isInView ? "animate-fade-in" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Furniture Gallery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our exquisite collection of handcrafted furniture pieces.
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {furnitureItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-lg h-64 md:h-72 cursor-pointer group transition-all duration-500 ${
                isInView ? "animate-slide-up" : "opacity-0"
              }`}
              style={isInView ? { animationDelay: `${index * 100}ms` } : {}}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredId === item.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-4">{item.name}</h3>
                  <button className="px-6 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
