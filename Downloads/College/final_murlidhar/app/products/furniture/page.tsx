"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function FurniturePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-16 md:pb-24 bg-gradient-to-b from-slate-50 to-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <Link href="/#products" className="text-[#1a3a52] hover:text-[#1a3a52]/80 font-semibold mb-4 inline-block">
              ← Back to Products
            </Link>
          </div>

          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a3a52] mb-4">Furniture & Interiors</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Handcrafted furniture and custom interior solutions designed for modern living
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up border-l-4 border-[#d4a574]">
              <h2 className="text-3xl font-bold text-[#1a3a52] mb-6">Our Furniture Collection</h2>
              <ul className="space-y-4">
                {[
                  "Custom Designs - Tailored to your preferences",
                  "Premium Materials - Only finest wood and fabrics",
                  "Expert Craftsmanship - Skilled artisans & designers",
                  "Timeless Style - Contemporary and classic designs",
                  "Durability Tested - Built to last generations",
                  "Interior Consultation - Professional design advice",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1a3a52] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      ✓
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="bg-[#1a3a52] rounded-lg shadow-lg p-8 text-white animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <h2 className="text-3xl font-bold mb-6">Furniture Categories</h2>
              <div className="space-y-4">
                {[
                  { name: "Living Room Sets", desc: "Sofas, tables, and entertainment units" },
                  { name: "Bedroom Furniture", desc: "Beds, wardrobes, and dressers" },
                  { name: "Office Desks", desc: "Ergonomic and professional workspaces" },
                  { name: "Modular Pieces", desc: "Flexible and space-saving solutions" },
                ].map((product) => (
                  <div key={product.name} className="border-l-4 border-[#d4a574] pl-4">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-gray-300 text-sm">{product.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg shadow-lg p-8 animate-fade-in border-2 border-[#d4a574]"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-3xl font-bold text-[#1a3a52] mb-8 text-center">Why Choose Our Furniture?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Design Options", value: "500+" },
                { label: "Delivery Time", value: "3-6 weeks" },
                { label: "Warranty", value: "5 Years" },
                { label: "Customization", value: "Full" },
              ].map((spec) => (
                <div key={spec.label} className="text-center p-4 bg-gray-50 rounded-lg border-2 border-[#d4a574]">
                  <p className="text-[#1a3a52] font-bold text-sm mb-2">{spec.label}</p>
                  <p className="text-2xl font-bold text-[#1a3a52]">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/learn-more"
              className="inline-block px-8 py-3 bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white font-bold rounded-lg transition-colors duration-300"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
