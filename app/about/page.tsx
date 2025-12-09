import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Award, Users, Star } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Dr. Kavitha Thomas</h1>
            <p className="text-xl text-gray-600 mb-8">
              Dedicated homoeopathic practitioner with over 15 years of experience 
              in treating chronic diseases and improving patient lives through natural medicine.
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-16">
        {/* Doctor Profile */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Meet Dr. Kavitha Thomas</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Dr. Kavitha Thomas is a renowned homoeopathic doctor based in Areekkad, Kozhikode, 
                with expertise in treating chronic illnesses, skin disorders, women's health issues, 
                and pediatric conditions.
              </p>
              <p className="text-gray-700">
                Her approach combines traditional homoeopathic principles with modern medical 
                understanding, providing personalized treatment plans for each patient.
              </p>
              <p className="text-gray-700">
                Dr. Thomas believes in treating the root cause of diseases rather than just 
                suppressing symptoms, ensuring long-term health and wellness.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Qualifications</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-primary mr-3" />
                  <span>DHMS (Diploma in Homoeopathic Medicine & Surgery)</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-primary mr-3" />
                  <span>MD (Homoeopathy) - Post Graduation</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-primary mr-3" />
                  <span>15+ Years of Clinical Experience</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-primary mr-3" />
                  <span>Specialized in Chronic Disease Management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Treatment Philosophy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Patient-Centered Care</h4>
                <p className="text-gray-600">Individualized treatment plans based on complete patient history</p>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Holistic Approach</h4>
                <p className="text-gray-600">Treating mind, body, and spirit as interconnected systems</p>
              </div>
              
              <div className="text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Long-term Wellness</h4>
                <p className="text-gray-600">Focus on sustainable health improvements rather than quick fixes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Clinic Information</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">9 AM - 5 PM</div>
              <div className="text-gray-600">Monday to Saturday</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">₹300</div>
              <div className="text-gray-600">First Consultation Fee</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">30-45 min</div>
              <div className="text-gray-600">Consultation Duration</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-dark mb-2">5000+</div>
              <div className="text-gray-600">Patients Treated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}