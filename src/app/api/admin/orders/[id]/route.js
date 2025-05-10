import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Fetch specific order
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure only admin can access this route
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order with comprehensive details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            shippingAddress: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Recalculate total to ensure accuracy
    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );

    // Return order with recalculated total
    return NextResponse.json({
      ...order,
      total: calculatedTotal
    });
  } catch (error) {
    console.error("Admin order detail fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching order details" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure only admin can modify orders
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              }
            }
          }
        }
      }
    });

    // Recalculate total to ensure accuracy
    const calculatedTotal = updatedOrder.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );

    return NextResponse.json({
      ...updatedOrder,
      total: calculatedTotal
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "Error updating order status" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an order
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure only admin can access this route
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Order deletion error:", error);
    return NextResponse.json(
      { error: "Error deleting order" },
      { status: 500 }
    );
  }
}
