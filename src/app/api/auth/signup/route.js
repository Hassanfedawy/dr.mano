import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, phoneNumber, shippingAddress, email, password } = await req.json();

    if (!name || !phoneNumber || !password) {
      return NextResponse.json(
        { message: "Name, phone number, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists with the same phone number
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        shippingAddress,
        email, // Email is now optional
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        shippingAddress: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}