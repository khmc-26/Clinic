'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Implement contact form submission
    console.log('Form submitted:', formData)
    
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-16">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
          Get in touch with us for appointments, queries, or feedback
        </p>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <a href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '+919495258572'}`} className="text-gray-600 hover:text-primary">
                      {process.env.NEXT_PUBLIC_CLINIC_PHONE || '+91 9495258572'}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <a href={`mailto:${process.env.NEXT_PUBLIC_CLINIC_EMAIL || 'drkavithahc@gmail.com'}`} className="text-gray-600 hover:text-primary">
                      {process.env.NEXT_PUBLIC_CLINIC_EMAIL || 'drkavithahc@gmail.com'}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">
                      {process.env.NEXT_PUBLIC_CLINIC_ADDRESS || 'Homoe Medical Centre, Areekkad, Kozhikode, Kerala'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Working Hours</h4>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 5:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Find us on Google Maps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Google Maps Integration</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>We'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Your email address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="What is this regarding?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Your message..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending...' : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Emergency Contact */}
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">For Emergencies</h3>
              <p className="text-red-700 mb-4">
                If this is a medical emergency, please call emergency services immediately.
              </p>
              <Button variant="destructive" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Emergency: Call 112 or 108
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}