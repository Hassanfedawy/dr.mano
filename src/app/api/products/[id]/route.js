import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}


// PUT update product (admin only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { id } = params; // Get userId from URL params

    // Check if category is provided as a slug
    let categoryId = null;
    if (data.category) {
      try {
        const categoryData = await prisma.category.findFirst({
          where: { slug: data.category }
        });
        if (categoryData) {
          categoryId = categoryData.id;
          // Remove category from data and add categoryId
          delete data.category;
          data.categoryId = categoryId;
        }
      } catch (categoryError) {
        console.error("Error finding category:", categoryError);
      }
    }

    // Make sure link field is handled properly
    if (data.link === '') {
      data.link = null;
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

// DELETE product (admin only)
export async function DELETE(req, { params }) {
  const { id } = params; // Get userId from URL params
  try {
    // Perform the deletion
    await prisma.product.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Product deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return new Response(JSON.stringify({ error: "Error deleting product" }), { status: 500 });
  }
}
