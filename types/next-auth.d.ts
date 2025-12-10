// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      phone?: string | null
      isDoctor?: boolean
      isAdmin?: boolean  // ADD THIS LINE
    }
  }
  
  interface User {
    id: string
    email?: string | null
    name?: string | null
    role?: string
    isDoctor?: boolean
    isAdmin?: boolean  // ADD THIS LINE
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    email?: string
    isDoctor?: boolean
    isAdmin?: boolean  // ADD THIS LINE
  }
}