// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/portal",
    signOut: "/",
    error: "/portal/error",
    verifyRequest: "/portal/verify-request",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        
        // Try to get user role, but don't fail if it doesn't work
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { phone: true, role: true, name: true }
          })
          
          if (user) {
            session.user.role = user.role
            session.user.phone = user.phone
            session.user.name = user.name || session.user.name
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error)
          // Continue without user data
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug for troubleshooting
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }