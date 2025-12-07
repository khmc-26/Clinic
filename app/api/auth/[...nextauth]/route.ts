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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔐 SignIn callback - User email:', user.email);
      console.log('🔐 SignIn callback - Account provider:', account?.provider);
      console.log('🔐 SignIn callback - Profile:', profile);
      
      // Handle Google OAuth specifically
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (existingUser) {
            console.log('🔐 Found existing user:', existingUser.id, 'Role:', existingUser.role);
            
            // Check if Google account is already linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: 'google',
                providerAccountId: account.providerAccountId
              }
            });
            
            if (!existingAccount) {
              console.log('🔐 Linking Google account to existing user');
              // Create new account link
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              });
              console.log('🔐 Account linked successfully');
            } else {
              console.log('🔐 Account already linked, updating tokens');
              // Update tokens for existing account
              await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  scope: account.scope,
                }
              });
            }
            
            // Update user profile information
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date()
              }
            });
            
            // IMPORTANT: Set the user ID to the existing user's ID
            // This ensures the adapter uses the existing user
            user.id = existingUser.id;
          } else {
            console.log('🔐 No existing user found, will create new user');
          }
        } catch (error) {
          console.error('🔐 Error in signIn callback:', error);
          // Don't block sign in on error
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account, profile }) {
      console.log('🔐 JWT callback - Token sub:', token.sub, 'User email:', user?.email);
      
      // When user first signs in, user object is available
      if (user) {
        console.log('🔐 JWT callback - User object ID:', user.id);
        token.id = user.id;
        // Role will be fetched from database below
      }
      
      // Always fetch role and user data from database
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { 
              role: true, 
              email: true, 
              name: true,
              phone: true 
            }
          });
          
          if (dbUser) {
            console.log('🔐 JWT callback - Database user found:', dbUser.email, 'Role:', dbUser.role);
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.phone = dbUser.phone;
          } else {
            console.warn('🔐 JWT callback - No user found in database with id:', token.sub);
          }
        } catch (error) {
          console.error('🔐 JWT callback - Error fetching user:', error);
        }
      }
      
      console.log('🔐 JWT callback - Final token:', {
        sub: token.sub,
        role: token.role,
        email: token.email
      });
      
      return token;
    },
    
    async session({ session, token }) {
      console.log('🔐 Session callback - Token:', {
        sub: token.sub,
        role: token.role,
        email: token.email
      });
      
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
        
        console.log('🔐 Session callback - Final session user:', {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          name: session.user.name
        });
      }
      
      return session;
    }
  },
  events: {
    async linkAccount({ user, account, profile }) {
      console.log('🔐 LinkAccount event - User:', user.email, 'Account:', account.provider);
    },
    async createUser({ user }) {
      console.log('🔐 CreateUser event - New user created:', user.email);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }