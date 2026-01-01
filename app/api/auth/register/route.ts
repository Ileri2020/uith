import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, first_name, last_name, phone_number, role, ...rest } = body

        if (!email || !password) {
            return NextResponse.json({ message: "Missing email or password" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                first_name,
                last_name,
                phone_number,
                role,
                ...rest,
                // Set isCertified to false for professionals by default
                isCertified: role === 'patient' ? true : false,
            }
        })

        return NextResponse.json({ message: "User created successfully", user }, { status: 201 })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
