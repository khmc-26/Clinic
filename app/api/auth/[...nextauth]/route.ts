// app/api/auth/[...nextauth]/route.ts - COMPLETE FIXED VERSION
import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { DoctorCredentialsService } from "@/lib/auth/doctor-credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required")
        }

        // MAGIC LINK: Handle sign in without password
        if (credentials.email && !credentials.password) {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              doctor: true,
              patient: true
            }
          })

          if (!user) {
            throw new Error("User not found")
          }

          // Check if this is a doctor trying to use magic link
          if (user.doctor) {
            throw new Error("Doctors must use password login")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Patient',
            role: user.role || 'PATIENT',
            isDoctor: false
          }
        }

        // DOCTOR LOGIN: Handle password authentication
        if (!credentials?.password) {
          throw new Error("Password is required for doctor login")
        }

        // Option 1: Try new credential system
        try {
          // Check if it's a registered doctor email
          const isDoctorEmail = await DoctorCredentialsService.isRegisteredDoctor(credentials.email)
          
          if (!isDoctorEmail) {
            throw new Error("Access restricted to registered doctors only")
          }

          // Validate using new credential system
          const result = await DoctorCredentialsService.validateCredentials(
            credentials.email,
            credentials.password
          )

          if (result.valid && result.doctor) {
            return {
              id: result.doctor.id,
              email: result.doctor.email,
              name: result.doctor.name,
              role: result.doctor.isAdmin ? 'ADMIN' : 'DOCTOR',
              isDoctor: true
            }
          }
          
          if (result.locked) {
            throw new Error("Account locked. Try again in 15 minutes.")
          }
        } catch (error) {
          console.log('New credential system error:', error)
          // Fall through to old system
        }

        // Option 2: Fallback to old hardcoded credentials
        if (
          credentials.email === 'drkavithahc@gmail.com' &&
          credentials.password === 'Doctor@2024'
        ) {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: 'Dr. Kavitha Thomas',
                role: 'ADMIN',
                emailVerified: new Date(),
                doctor: {
                  create: {
                    specialization: 'Homoeopathy',
                    qualifications: ['BHMS', 'MD'],
                    experience: 15,
                    consultationFee: 300,
                    isAdmin: true,
                    isActive: true,
                    colorCode: '#EF4444'
                  }
                }
              }
            })
          } else {
            // Ensure doctor record exists and is admin
            const doctor = await prisma.doctor.findUnique({
              where: { userId: user.id }
            })
            
            if (!doctor) {
              await prisma.doctor.create({
                data: {
                  userId: user.id,
                  specialization: 'Homoeopathy',
                  qualifications: ['BHMS', 'MD'],
                  experience: 15,
                  consultationFee: 300,
                  isAdmin: true,
                  isActive: true,
                  colorCode: '#EF4444'
                }
              })
            } else if (!doctor.isAdmin) {
              // Update to admin if not already
              await prisma.doctor.update({
                where: { id: doctor.id },
                data: {
                  isAdmin: true,
                  isActive: true,
                  colorCode: '#EF4444'
                }
              })
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'ADMIN',
            isDoctor: true
          }
        }

        throw new Error("Invalid credentials")
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/portal/login',
    signOut: '/',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log('🔐 SignIn - User:', user?.email, 'Provider:', account?.provider)
      
      // Handle Google OAuth
      if (account?.provider === 'google' && user?.email) {
        try {
          // First check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              accounts: true,
              doctor: true,
              patient: true
            }
          })

          // CRITICAL FIX: Handle existing users properly
          if (existingUser) {
            console.log('🔐 Existing user found:', existingUser.email)
            
            // Check if this OAuth account is already linked
            const accountLinked = existingUser.accounts.some(acc => 
              acc.provider === account.provider && 
              acc.providerAccountId === account.providerAccountId
            )

            if (!accountLinked) {
              console.log('🔐 Linking OAuth account to existing user')
              // Force the user ID to be the existing user's ID
              // This tells NextAuth to link the OAuth account to existing user
              user.id = existingUser.id
            }
            
            // Store role information for JWT callback
            (user as any).existingRole = existingUser.role;
            (user as any).isDoctor = !!existingUser.doctor;
            
            // Update user info if needed (fire and forget - don't await)
            prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date()
              }
            }).catch(error => {
              console.error('Failed to update user:', error)
            });
          }
          
          // If no existing user, allow creation (PrismaAdapter will handle)
          return true
          
        } catch (error) {
          console.error('🔐 SignIn error:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role || (user as any).existingRole || 'PATIENT'
        token.isDoctor = (user as any).isDoctor || false
        token.isAdmin = (user as any).role === 'ADMIN' || false
      }

      // For security, only set isDoctor if we have user object or can verify from DB
      if (token.email === 'drkavithahc@gmail.com' && !token.isDoctor) {
        // Double-check from database
        const doctor = await prisma.doctor.findFirst({
          where: {
            user: {
              email: token.email
            },
            isActive: true
          }
        })
        if (doctor) {
          token.isDoctor = true
          token.role = doctor.isAdmin ? 'ADMIN' : 'DOCTOR'
          token.isAdmin = doctor.isAdmin
        }
      }

      // Also check for other doctors
      if (token.email && token.email !== 'drkavithahc@gmail.com' && !token.isDoctor) {
        const doctor = await prisma.doctor.findFirst({
          where: {
            user: {
              email: token.email
            },
            isActive: true
          }
        })
        if (doctor) {
          token.isDoctor = true
          token.role = 'DOCTOR'
          token.isAdmin = doctor.isAdmin
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      console.log('🔐 JWT token:', { 
        email: token.email, 
        isDoctor: token.isDoctor,
        role: token.role, 
        isAdmin: token.isAdmin
      })

      return token
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.isDoctor = token.isDoctor as boolean
        session.user.isAdmin = token.isAdmin as boolean
        // Final verification for admin doctor
        if (session.user.email === 'drkavithahc@gmail.com' && !session.user.isDoctor) {
          const doctor = await prisma.doctor.findFirst({
            where: {
              user: {
                email: session.user.email
              },
              isActive: true
            }
          })
          if (doctor) {
            session.user.isDoctor = true
            session.user.role = doctor.isAdmin ? 'ADMIN' : 'DOCTOR'
            session.user.isAdmin = doctor.isAdmin
          }
        }
      }

      console.log('🔐 Session user:', { 
        email: session.user?.email, 
        isDoctor: session.user?.isDoctor,
        role: session.user?.role,
        isAdmin: session.user?.isAdmin
      })

      return session
    },

    async redirect({ url, baseUrl }: any) {
      console.log('🔐 Redirect callback - URL:', url, 'Base URL:', baseUrl)
      
      // If URL is a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If URL already has baseUrl, return as is
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Default fallback to home page
      return baseUrl
    }
  },
  events: {
    async signIn({ user, account }: any) {
      console.log('User signed in:', user?.email, 'via', account?.provider)
    },
    async signOut({ token }: any) {
      console.log('User signed out:', token?.email)
    }
  },
  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }