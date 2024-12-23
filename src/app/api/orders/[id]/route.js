import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req,{params}) {
  try {
    const orderId  = await params.id;

    // Validate orderId
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Get the user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the order from the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true, // Include product details
          },
        },
      },
    });

    // Check if the order exists and belongs to the logged-in user
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Respond with the order details
    return NextResponse.json(order);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : (error || "Unknown error occurred");

    console.error('Error fetching order:', errorMessage);
    return NextResponse.json(
      { error: `Error fetching order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
