import {prisma } from "../lib/prisma"
import bcrypt from "bcrypt"

export async function getUserdb(
    email:string,
    password:string){
    const user = await prisma.admin.findUnique({
        where: {
            email
        }
    })
    if(!user){
        return { user: null, isValid: false }
    }

    // Debug logging (always log in development, log failures in production)
    const isDev = process.env.NODE_ENV !== "production"
    
    if (isDev) {
      console.log("🔐 Password check:", {
        email,
        passwordLength: password.length,
        hashedPasswordPreview: user.password.substring(0, 20) + "...",
        hashedPasswordLength: user.password.length,
        userActive: user.active
      })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    
    // Log results
    if (isDev) {
      console.log("✅ Password match:", isValid)
    } else if (!isValid) {
      // Log failures in production for debugging
      console.log("❌ Authentication failed for:", email)
    }
    
    if (!isValid) return { user: null, isValid: false }

    if (!user.active) return { user: null, isValid: false }

    return { user, isValid: true }
}