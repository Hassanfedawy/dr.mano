import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all products
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Build the where clause
    let where = {};

    // If category is specified, filter by category
    if (categorySlug) {
      try {
        console.log(`Finding category with slug: ${categorySlug}`);

        // Find the category by slug
        const category = await prisma.category.findFirst({
          where: { slug: categorySlug }
        });

        console.log('Category found:', category);

        // If category exists, filter products by categoryId
        if (category) {
          where.categoryId = category.id;
        } else {
          console.log(`No category found with slug: ${categorySlug}`);
          // For debugging, let's return some products anyway
          return NextResponse.json({
            products: [],
            pagination: {
              total: 0,
              pages: 0,
              current: page
            }
          });
        }
      } catch (categoryError) {
        console.error("Error finding category:", categoryError);
        // Return empty results on error
        return NextResponse.json({
          products: [],
          pagination: {
            total: 0,
            pages: 0,
            current: page
          }
        });
      }
    }

    // Fetch products and count
    let products = [];
    let total = 0;

    try {
      console.log('Fetching products with where clause:', where);

      // Get products with their categories
      products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true
        }
      });

      console.log(`Found ${products.length} products`);

      // Get total count
      total = await prisma.product.count({ where });
      console.log(`Total products count: ${total}`);
    } catch (fetchError) {
      console.error("Error fetching products:", fetchError);
      // Return empty results on error
      return NextResponse.json({
        products: [],
        pagination: {
          total: 0,
          pages: 0,
          current: page
        }
      });
    }

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Return response
    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: totalPages,
        current: page,
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    // Return a safe response on error
    return NextResponse.json({
      products: [],
      pagination: {
        total: 0,
        pages: 0,
        current: 1
      },
      error: "Error processing request"
    });
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
      image,
      category,
      link
    } = data;

    // All fields are now optional

    // Find category if provided
    let categoryId = null;
    if (category) {
      try {
        const categoryData = await prisma.category.findFirst({
          where: { slug: category }
        });
        if (categoryData) {
          categoryId = categoryData.id;
        }
      } catch (categoryError) {
        console.error("Error finding category:", categoryError);
      }
    }

    // Create product with all optional fields
    const productData = {
      name: name || '',
      mainDescription: mainDescription || '',
      subDescription: subDescription || '',
      price: price ? parseFloat(price) : 0,
      stock: stock ? parseInt(stock) : 0,
      images: image || '',
      categoryId: categoryId || undefined,
    };

    // Only add link if it exists
    if (link) {
      productData.link = link;
    }

    const product = await prisma.product.create({
      data: productData,
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
