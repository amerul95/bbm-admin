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
        return null
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    if (!user.active) return null

    return user
}