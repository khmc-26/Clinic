import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Brain, Baby, Activity, Shield, Droplets } from 'lucide-react'

const services = [
  {
    icon: Heart,
    title: "Women's Health",
    description: "Treatment for PCOD, menstrual disorders, menopause symptoms, and hormonal imbalances using natural homoeopathic remedies.",
    conditions: ["PCOD/PCOS", "Menstrual Irregularities", "Menopause Management", "Hormonal Imbalance"]
  },
  {
    icon: Brain,
    title: "Chronic Diseases",
    description: "Management of long-term conditions like arthritis, diabetes, hypertension, and thyroid disorders.",
    conditions: ["Arthritis", "Diabetes", "Hypertension", "Thyroid Disorders"]
  },
  {
    icon: Baby,
    title: "Child Health",
    description: "Safe and effective treatment for common childhood ailments, behavioral issues, and developmental concerns.",
    conditions: ["Recurrent Infections", "Allergies", "ADHD", "Growth Concerns"]
  },
  {
    icon: Activity,
    title: "Skin Disorders",
    description: "Treatment for eczema, psoriasis, acne, and other skin conditions without side effects.",
    conditions: ["Eczema", "Psoriasis", "Acne", "Vitiligo"]
  },
  {
    icon: Shield,
    title: "Allergy Treatment",
    description: "Desensitization therapy for respiratory, food, and environmental allergies.",
    conditions: ["Asthma", "Rhinitis", "Food Allergies", "Dust Allergy"]
  },
  {
    icon: Droplets,
    title: "Respiratory Issues",
    description: "Management of asthma, bronchitis, sinusitis, and recurrent respiratory infections.",
    conditions: ["Asthma", "Bronchitis", "Sinusitis", "Recurrent Cough & Cold"]
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Homoeopathic Services</h1>
            <p className="text-xl text-gray-600">
              Comprehensive natural treatment for various health conditions without side effects
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-16">
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Conditions Treated:</h4>
                  <ul className="space-y-2">
                    {service.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Treatment Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Our Treatment Process</CardTitle>
            <CardDescription>Step-by-step approach to holistic healing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Detailed Case Study</h4>
                <p className="text-sm text-gray-600">Complete medical history and symptom analysis</p>
              </div>
              
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Personalized Medicine</h4>
                <p className="text-sm text-gray-600">Selection of appropriate homoeopathic remedy</p>
              </div>
              
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Regular Follow-up</h4>
                <p className="text-sm text-gray-600">Monitoring progress and adjusting treatment</p>
              </div>
              
              <div className="text-center p-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h4 className="font-semibold mb-2">Lifestyle Guidance</h4>
                <p className="text-sm text-gray-600">Diet and lifestyle recommendations for holistic health</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Types */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Consultation Options</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="border rounded-xl p-6 hover:border-primary transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-primary">In-Person Consultation</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mr-3"></span>
                  <span>Face-to-face detailed examination</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mr-3"></span>
                  <span>Physical examination when required</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mr-3"></span>
                  <span>Direct interaction with doctor</span>
                </li>
              </ul>
              <div className="text-lg font-semibold">Fee: ₹300 (First Visit)</div>
            </div>
            
            <div className="border rounded-xl p-6 hover:border-secondary transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-secondary">Online Consultation</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-secondary mr-3"></span>
                  <span>Video consultation via Google Meet</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-secondary mr-3"></span>
                  <span>Convenient from home or office</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-secondary mr-3"></span>
                  <span>Digital prescription delivery</span>
                </li>
              </ul>
              <div className="text-lg font-semibold">Fee: ₹300 (First Visit)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}