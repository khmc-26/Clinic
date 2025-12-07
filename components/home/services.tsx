// components/home/services.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stethoscope, Heart, Users, Baby, Shield, Brain } from 'lucide-react'

const SERVICES = [
  {
    icon: Stethoscope,
    title: "Chronic Disease Treatment",
    description: "Diabetes, Hypertension, Arthritis treated with homoeopathy",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Heart,
    title: "Skin Problems",
    description: "Eczema, Psoriasis, Acne, Allergic skin conditions",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Users,
    title: "Women's Health",
    description: "PCOS, Menstrual disorders, Menopause, Fertility",
    color: "bg-accent/10 text-accent-dark",
  },
  {
    icon: Baby,
    title: "Child Health",
    description: "Recurrent infections, Asthma, ADHD, Growth issues",
    color: "bg-success/10 text-success",
  },
  {
    icon: Shield,
    title: "Allergy Treatment",
    description: "Food allergies, Respiratory allergies, Skin allergies",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Brain,
    title: "Mental Health",
    description: "Anxiety, Depression, Stress, Insomnia treatment",
    color: "bg-info/10 text-info",
  },
]

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Homoeopathic Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive treatment for various health conditions using natural homoeopathic medicines
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className={`h-14 w-14 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon className="h-7 w-7" />
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Button variant="ghost" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}