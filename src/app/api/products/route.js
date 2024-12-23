import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all products
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const where = category ? { category } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

// POST new product (admin only)
export async function POST(req) {
  try {
    const data = await req.json();

    // Validate data payload
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { 
      name, 
      price, 
      mainDescription, 
      subDescription, 
      stock, 
      image 
    } = data;

    // Check for missing fields
    if (!name || !price || !mainDescription || !subDescription || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse and sanitize inputs
    const product = await prisma.product.create({
      data: {
        name,
        mainDescription,
        subDescription,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        images: image,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}
