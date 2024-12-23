import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    console.log("Received request for user profile");

    const session = await getServerSession(authOptions);
    console.log("Session retrieved:", session);
    
    if (!session || !session.user || !session.user.id) {
      console.error("Session retrieval failed:", session);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    console.log("User retrieved:", user);

    if (!user) {
      console.warn("User not found for ID:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:");
    const errorMessage = (error && typeof error.message === 'string') ? error.message : "An unknown error occurred";
    
    // Ensure the response object is valid
    const responsePayload = {
      error: "Error fetching profile",
      details: errorMessage || "No details available"
    };

    console.error("Response payload:", responsePayload);
    return NextResponse.json(responsePayload, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, image } = data;

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: name || undefined,
        image: image || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating profile", details: error.message },
      { status: 500 }
    );
  }
}