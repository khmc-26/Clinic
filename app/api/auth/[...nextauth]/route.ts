// app/api/auth/[...nextauth]/route.ts - FOR NEXTAUTH v4
import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        // Hardcoded doctor credentials for now
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
                role: 'DOCTOR',
                emailVerified: new Date(),
                doctor: {
                  create: {
                    specialization: 'Homoeopathy',
                    qualifications: ['BHMS', 'MD'],
                    experience: 15,
                    consultationFee: 300
                  }
                }
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
      
      if (account?.provider === 'google' && user?.email) {
        const isDoctorEmail = user.email === 'drkavithahc@gmail.com'
        
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          // Create new user with proper role
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              role: isDoctorEmail ? 'DOCTOR' : 'PATIENT',
              ...(isDoctorEmail && {
                doctor: {
                  create: {
                    specialization: 'Homoeopathy',
                    qualifications: ['BHMS', 'MD'],
                    experience: 15,
                    consultationFee: 300
                  }
                }
              }),
              ...(!isDoctorEmail && {
                patient: {
                  create: {}
                }
              })
            }
          })
        } else {
          // Update existing user - ensure role is correct
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              emailVerified: new Date(),
              role: isDoctorEmail ? 'DOCTOR' : existingUser.role
            }
          })
        }

        user.id = existingUser.id;
        (user as any).role = existingUser.role;
        (user as any).isDoctor = isDoctorEmail;
        
        // DEBUG: Log role assignment
        console.log('🔐 Role assigned:', existingUser.role, 'isDoctor:', isDoctorEmail)
      }

      return true
    },

    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.isDoctor = (user as any).isDoctor || user.email === 'drkavithahc@gmail.com'
      }

      // Also check if it's doctor email even without user object
      if (token.email === 'drkavithahc@gmail.com') {
        token.isDoctor = true
        token.role = 'DOCTOR'
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      console.log('🔐 JWT token:', { 
        email: token.email, 
        isDoctor: token.isDoctor,
        role: token.role 
      })

      return token
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.isDoctor = token.isDoctor as boolean || token.email === 'drkavithahc@gmail.com'
        
        // Force doctor role for doctor email
        if (session.user.email === 'drkavithahc@gmail.com') {
          session.user.isDoctor = true
          session.user.role = 'DOCTOR'
        }
      }

      console.log('🔐 Session user:', { 
        email: session.user?.email, 
        isDoctor: session.user?.isDoctor,
        role: session.user?.role 
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