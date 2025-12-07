// components/home/hero.tsx
import { Button } from '@/components/ui/button'
import { Calendar, Phone, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Holistic Homoeopathic Treatment
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Natural Healing with{" "}
              <span className="text-primary">Homoeopathy</span> in{" "}
              <span className="text-secondary">Areekkad</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Dr. Kavitha Thomas provides personalized homoeopathic care for chronic diseases, 
              skin problems, allergies, and women's health issues. Experience natural healing 
              without side effects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/book">
                <Button size="lg" className="bg-primary hover:bg-primary-dark shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <a href={`tel:${process.env.CLINIC_PHONE}`} className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Call: {process.env.CLINIC_PHONE}
                </a>
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                <span>No Side Effects</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                <span>Personalized Treatment</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                <span>Online Consultation Available</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Doctor Image Placeholder */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20 aspect-[4/5]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_DOCTOR_NAME}</h3>
                  <p className="text-primary-light">{process.env.NEXT_PUBLIC_DOCTOR_QUALIFICATION}</p>
                  <p className="text-gray-300">{process.env.NEXT_PUBLIC_DOCTOR_EXPERIENCE}+ Years Experience</p>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
              <div className="text-3xl font-bold text-secondary">5000+</div>
              <div className="text-sm text-gray-600">Patients Treated</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}