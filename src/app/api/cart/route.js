import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Helper function to get or create a guest ID
const getOrCreateGuestId = () => {
  const cookieStore = cookies();
  let guestId = cookieStore.get("guestId")?.value;

  if (!guestId) {
    guestId = uuidv4();
    // We'll set the cookie in the response
  }

  return guestId;
};

// GET user's cart
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    let cart;

    if (session?.user?.id) {
      // Authenticated user - get cart by userId
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } else {
      // Guest user - get cart by guestId
      const guestId = getOrCreateGuestId();

      cart = await prisma.cart.findFirst({
        where: { guestId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Set the guestId cookie
      const response = NextResponse.json(cart || { items: [] });
      response.cookies.set("guestId", guestId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Error fetching cart" },
      { status: 500 }
    );
  }
}

// POST add to cart
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, quantity } = await req.json();
    let cart;
    let response;

    if (session?.user?.id) {
      // Authenticated user
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: session.user.id },
        });
      }
    } else {
      // Guest user
      const guestId = getOrCreateGuestId();

      cart = await prisma.cart.findFirst({
        where: { guestId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { guestId },
        });
      }

      // We'll set the cookie in the response later
    }

    // Add item to cart (same for both authenticated and guest users)
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // For guest users, set the cookie
    if (!session?.user?.id) {
      const guestId = cart.guestId;
      response = NextResponse.json(updatedCart);
      response.cookies.set("guestId", guestId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Error updating cart" },
      { status: 500 }
    );
  }
}
