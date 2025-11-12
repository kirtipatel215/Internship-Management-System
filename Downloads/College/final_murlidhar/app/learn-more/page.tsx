"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useState } from "react"

export default function LearnMorePage() {
  const [activeTab, setActiveTab] = useState("about")

  const tabs = [
    {
      id: "about",
      label: "About Us",
      content: {
        title: "About Murlidhar Ply & Hardware",
        description:
          "Established as a premier showroom in Kapadvanj, Gujarat, Murlidhar Ply & Hardware has been serving the community with exceptional quality products and outstanding customer service for years.",
        points: [
          "Premium quality plywood and furniture materials",
          "Wide range of hardware and fixtures",
          "Expert consultation and design services",
          "Competitive pricing and flexible payment options",
          "Fast and reliable delivery services",
          "Dedicated customer support team",
        ],
      },
    },
    {
      id: "products",
      label: "Our Products",
      content: {
        title: "Complete Product Range",
        description:
          "We offer a comprehensive selection of products to meet all your construction, furniture, and design needs.",
        points: [
          "Marine Plywood - Weather resistant and durable",
          "Commercial Grade Plywood - For large-scale projects",
          "Engineered Wood - Cost-effective solutions",
          "Decorative Hardware - Door handles, locks, and hinges",
          "Structural Hardware - Brackets, fasteners, and supports",
          "Custom Furniture - Tailored to your specifications",
        ],
      },
    },
    {
      id: "services",
      label: "Our Services",
      content: {
        title: "Comprehensive Services",
        description: "Beyond products, we provide expert services to ensure your project success.",
        points: [
          "Free consultation on material selection",
          "Interior design planning and execution",
          "Custom cutting and finishing services",
          "Installation guidance and support",
          "Bulk order discounts and corporate solutions",
          "After-sales support and warranty assistance",
        ],
      },
    },
    {
      id: "quality",
      label: "Quality Standards",
      content: {
        title: "Our Commitment to Quality",
        description: "We maintain the highest standards of quality in every product we offer.",
        points: [
          "ISO certified products and processes",
          "Rigorous quality control testing",
          "Use of eco-friendly materials",
          "Compliance with international standards",
          "Regular product certifications",
          "Customer satisfaction guarantee",
        ],
      },
    },
  ]

  const activeContent = tabs.find((tab) => tab.id === activeTab)

  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-16 md:pb-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learn More About Us</h1>
            <p className="text-lg text-muted-foreground">
              Discover everything you need to know about Murlidhar Ply & Hardware
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-12 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeContent && (
            <div className="bg-gradient-to-br from-white to-secondary/10 rounded-xl p-8 md:p-12 shadow-lg animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{activeContent.content.title}</h2>
              <p className="text-lg text-muted-foreground mb-8">{activeContent.content.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeContent.content.points.map((point, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-8">Contact us today for consultation and quotes</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="px-8 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-colors duration-300"
              >
                Contact Us
              </a>
              <a
                href="tel:+919429959415"
                className="px-8 py-3 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors duration-300"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
