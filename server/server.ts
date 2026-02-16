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

    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) return { user: null, isValid: false }

    if (!user.active) return { user: null, isValid: false }

    return { user, isValid: true }
}