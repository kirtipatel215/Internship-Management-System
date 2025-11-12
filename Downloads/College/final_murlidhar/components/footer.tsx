export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Murlidhar</h3>
            <p className="text-gray-300 text-sm">
              Premium plywood, furniture, and hardware solutions for your home and business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#home" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-primary transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#furniture" className="hover:text-primary transition-colors">
                  Furniture
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Kapadvanj, Gujarat</li>
              <li>387620</li>
              <li>
                <a href="tel:+919429959415" className="hover:text-primary transition-colors">
                  +91 94299 59415
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">
                📘
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">
                📷
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">
                💬
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} Murlidhar Ply & Hardware | Designed by Kirti Patel</p>
        </div>
      </div>
    </footer>
  )
}
