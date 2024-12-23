import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { id } = params; // Extract 'id' from dynamic route
  const { quantity } = await req.json(); // Extract body data

  if (!id || quantity < 1) {
    return NextResponse.json(
      { error: "Invalid item or quantity" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, cart: { userId: session.user.id } },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Error updating cart item" },
      { status: 500 }
    );
  }
}


// DELETE remove cart item
export async function DELETE(req, { params }) {
  try {
    // Extract the session to ensure the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract the `id` from dynamic route params
    const { id } = params;

    // Validate the presence of the `id`
    if (!id) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Check if the cart item exists and belongs to the current user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          userId: session.user.id, // Ensure the item belongs to the logged-in user
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id },
    });

    // Return success response
    return NextResponse.json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Error removing cart item" },
      { status: 500 }
    );
  }
}
  