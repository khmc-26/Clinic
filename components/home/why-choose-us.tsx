// components/home/why-choose-us.tsx
import { CheckCircle, Clock, Users, Shield } from 'lucide-react'

const FEATURES = [
  {
    icon: CheckCircle,
    title: "No Side Effects",
    description: "Homoeopathic medicines are natural and have no side effects, safe for all ages"
  },
  {
    icon: Clock,
    title: "Personalized Treatment",
    description: "Each patient receives individualized treatment based on their unique symptoms"
  },
  {
    icon: Users,
    title: "Experienced Doctor",
    description: "15+ years of experience in treating various chronic and acute conditions"
  },
  {
    icon: Shield,
    title: "Holistic Approach",
    description: "Treats the root cause, not just symptoms, for long-term healing"
  }
]

export default function WhyChooseUs() {
  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our Clinic?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our patient-centered approach to homoeopathic treatment
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}