"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "Plywood & Laminates",
    description: "Premium quality plywood and laminates for construction and furniture making.",
    icon: "🪵",
    href: "/products/plywood",
  },
  {
    id: 2,
    name: "Furniture & Interiors",
    description: "Elegant furniture pieces and interior solutions for homes and offices.",
    icon: "🪑",
    href: "/products/furniture",
  },
  {
    id: 3,
    name: "Hardware & Accessories",
    description: "Complete range of hardware and accessories for all your needs.",
    icon: "🔧",
    href: "/products/hardware",
  },
]

export default function ProductsSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
          setVisibleCards((prev) => [...new Set([...prev, index])])
        }
      })
    })

    const cards = document.querySelectorAll(".product-card")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="products" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Product Categories</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Link key={product.id} href={product.href} className="no-underline">
              <div
                data-index={index}
                className={`product-card bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
                  visibleCards.includes(index) ? "animate-slide-up" : "opacity-0"
                }`}
                style={visibleCards.includes(index) ? { animationDelay: `${index * 100}ms` } : {}}
              >
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <span className="text-primary hover:text-accent font-semibold text-sm transition-colors">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
