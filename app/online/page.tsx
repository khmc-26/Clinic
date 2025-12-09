import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, CheckCircle, Clock, Shield } from 'lucide-react'

export default function OnlinePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Online Consultation</h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Get homoeopathic treatment from the comfort of your home
          </p>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Book Appointment</h4>
                      <p className="text-gray-600">Select online consultation and choose your time slot</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Receive Meeting Link</h4>
                      <p className="text-gray-600">Google Meet link sent via email after booking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Video Consultation</h4>
                      <p className="text-gray-600">30-45 minute detailed consultation with Dr. Kavitha Thomas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Receive Prescription</h4>
                      <p className="text-gray-600">Digital prescription and follow-up plan sent via email</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center">
                <Button size="lg" className="mb-4">
                  <Video className="mr-2 h-5 w-5" />
                  Book Online Consultation
                </Button>
                <p className="text-sm text-gray-500">Fee: ₹300 (First Visit)</p>
              </div>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Benefits of Online Consultation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span>No travel required</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span>Consult from anywhere</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span>Save time and money</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span>Safe and secure</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span>Digital prescription delivery</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-3" />
                      <span>Stable internet connection</span>
                    </div>
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-primary mr-3" />
                      <span>Webcam and microphone</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-primary mr-3" />
                      <span>Google Meet app (desktop or mobile)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}