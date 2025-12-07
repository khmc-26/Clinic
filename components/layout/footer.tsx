// components/layout/footer.tsx
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Clinic Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dr. Kavitha Thomas</h3>
            <p className="text-gray-300 mb-4">
              Providing natural homoeopathic treatment for chronic diseases, 
              skin problems, and women's health issues.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Doctor</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Our Services</Link></li>
              <li><Link href="/book" className="text-gray-300 hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link href="/online" className="text-gray-300 hover:text-white transition-colors">Online Consultation</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Health Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Chronic Disease Treatment</li>
              <li className="text-gray-300">Skin Problems</li>
              <li className="text-gray-300">Women's Health</li>
              <li className="text-gray-300">Child Health</li>
              <li className="text-gray-300">Allergy Treatment</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-300">{process.env.NEXT_PUBLIC_CLINIC_PHONE}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-300">{process.env.NEXT_PUBLIC_CLINIC_EMAIL}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-300">{process.env.NEXT_PUBLIC_CLINIC_ADDRESS}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-gray-300">Mon-Sat: 9AM - 5PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Dr. Kavitha Thomas Homoeopathic Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}