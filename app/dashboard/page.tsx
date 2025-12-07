// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { FileText, Video } from 'lucide-react'


export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
  })

  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // This would fetch real data from your API
      // For now, using mock data
      setStats({
        totalAppointments: 156,
        todayAppointments: 8,
        pendingAppointments: 12,
        totalPatients: 89,
      })

      setRecentAppointments([
        {
          id: '1',
          patientName: 'John Doe',
          time: '10:00 AM',
          type: 'IN_PERSON',
          status: 'CONFIRMED',
        },
        {
          id: '2',
          patientName: 'Jane Smith',
          time: '11:30 AM',
          type: 'ONLINE',
          status: 'PENDING',
        },
        {
          id: '3',
          patientName: 'Robert Johnson',
          time: '2:00 PM',
          type: 'IN_PERSON',
          status: 'CONFIRMED',
        },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Confirmations",
      value: stats.pendingAppointments,
      icon: AlertCircle,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, Dr. Kavitha Thomas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>{format(new Date(), 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{appointment.patientName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{appointment.time}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.type === 'ONLINE' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {appointment.type === 'ONLINE' ? 'Online' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Link href="/dashboard/appointments">
                <Button variant="outline" className="w-full">
                  View All Appointments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/appointments/new">
                <Button className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </Link>
              
              <Link href="/dashboard/prescriptions/new">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Prescription
                </Button>
              </Link>
              
              <Link href="/dashboard/patients/new">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              </Link>
              
              <Link href="/online">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="mr-2 h-4 w-4" />
                  Start Video Consultation
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mr-3"></div>
                  <span>Appointment confirmed with John Doe</span>
                  <span className="text-gray-400 ml-auto">10 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-success mr-3"></div>
                  <span>Prescription issued to Jane Smith</span>
                  <span className="text-gray-400 ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-warning mr-3"></div>
                  <span>Follow-up scheduled for Robert</span>
                  <span className="text-gray-400 ml-auto">2 hours ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}