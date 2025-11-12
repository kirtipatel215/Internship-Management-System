"use client"

import type React from "react"
import { useState } from "react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("")

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus("Email sent successfully! We'll get back to you soon.")
        setFormData({ name: "", email: "", message: "" })
        setTimeout(() => setStatus(""), 3000)
      } else {
        setStatus("Failed to send email. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      setStatus("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get In Touch</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="text-primary text-xl">📍</span>
                  <div>
                    <p className="font-semibold text-foreground">Address</p>
                    <p className="text-muted-foreground">23GJ+4MP, Gayatri Society, Kapadvanj, Gujarat 387620</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-primary text-xl">📞</span>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <a href="tel:+919429959415" className="text-primary hover:text-accent transition-colors">
                      +91 63520 24517
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-primary text-xl">💬</span>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <a
                      href="https://wa.me/916352024517"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.2894689969287!2d72.8217!3d22.2907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c3f0f0f0f0f0f%3A0x0!2sKapadvanj%2C%20Gujarat%20387620!5e0!3m2!1sen!2sin!4v1"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg animate-slide-up">
            <h3 className="text-xl font-bold text-foreground">Send us a Message</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors bg-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors bg-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors bg-input resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Sending..." : "Send Message"}
            </button>

            {status && (
              <div
                className={`p-4 rounded-lg text-sm ${status.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
