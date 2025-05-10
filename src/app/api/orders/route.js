import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Helper function to get the guest ID from cookies
const getGuestId = () => {
  const cookieStore = cookies();
  return cookieStore.get("guestId")?.value;
};

export async function POST(req) {
  console.log('[Orders API] POST request received');

  try {
    // Read the request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('[Orders API] Request body received:', JSON.stringify(requestBody));
    } catch (parseError) {
      console.error('[Orders API] Error parsing request body:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      shippingAddress,
      paymentMethod,
      phoneNumber,
      guestEmail,
      guestName,
      city,
      country,
      cartItems // New parameter containing cart items from Zustand store
    } = requestBody;

    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user?.id;

    // Validate cart items
    if (!cartItems || !cartItems.length) {
      console.error('[Orders API] Cart items missing or empty:', cartItems);
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    console.log('[Orders API] Cart items received:', JSON.stringify(cartItems));

    // Validate each cart item has required fields and fix any issues
    const validatedCartItems = [];

    for (const item of cartItems) {
      console.log('[Orders API] Validating cart item:', item);

      // Check for required fields
      if (!item.productId || item.quantity === undefined || item.price === undefined) {
        console.error('[Orders API] Invalid cart item missing required fields:', item);
        return NextResponse.json(
          { error: "Invalid cart item format: missing required fields" },
          { status: 400 }
        );
      }

      // Ensure productId is a valid string
      if (typeof item.productId !== 'string') {
        console.error('[Orders API] Invalid productId type:', typeof item.productId);
        return NextResponse.json(
          { error: "Invalid productId format" },
          { status: 400 }
        );
      }

      // Ensure quantity is a number
      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        console.error('[Orders API] Invalid quantity:', item.quantity);
        return NextResponse.json(
          { error: "Invalid quantity: must be a positive number" },
          { status: 400 }
        );
      }

      // Ensure price is a number
      const price = Number(item.price);
      if (isNaN(price) || price < 0) {
        console.error('[Orders API] Invalid price:', item.price);
        return NextResponse.json(
          { error: "Invalid price: must be a non-negative number" },
          { status: 400 }
        );
      }

      // Add validated item to the array
      validatedCartItems.push({
        productId: item.productId,
        quantity: quantity,
        price: price
      });
    }

    if (validatedCartItems.length === 0) {
      console.error('[Orders API] No valid cart items found');
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    console.log('[Orders API] Cart items validated successfully:', validatedCartItems);

    // For guest users, validate required fields
    if (!isAuthenticated) {
      console.log('[Orders API] Guest checkout - validating guest fields');
      if (!guestEmail || !guestName) {
        console.error('[Orders API] Missing guest information');
        return NextResponse.json(
          { error: "Guest name and email are required" },
          { status: 400 }
        );
      }
    }

    // Calculate total price from validated cart items
    const totalPrice = validatedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    console.log('[Orders API] Calculated total price:', totalPrice);

    // Validate required fields
    if (!shippingAddress) {
      console.error('[Orders API] Missing shipping address');
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      console.error('[Orders API] Missing payment method');
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      console.error('[Orders API] Missing phone number');
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    console.log('[Orders API] All validation passed successfully');

    // Prepare order data
    console.log('[Orders API] Preparing order data');

    try {
      // Create order data based on authentication status
      // Ensure all fields are properly typed and not null/undefined
      // IMPORTANT: Only include fields that are defined in the Prisma schema
      const orderData = {
        items: {
          create: validatedCartItems.map(item => ({
            productId: String(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
        status: "PENDING",
        total: Number(totalPrice),
        shippingAddress: String(shippingAddress) + (city ? `, ${city}` : '') + (country ? `, ${country}` : ''),
        paymentMethod: String(paymentMethod),
        phoneNumber: phoneNumber ? String(phoneNumber) : "",
      };

      // Note: city and country are not in the Prisma schema, so we include them in the shippingAddress instead
      console.log('[Orders API] Combined shipping address with city and country:', orderData.shippingAddress);

      // Add user-specific or guest-specific data
      if (isAuthenticated && session?.user?.id) {
        console.log('[Orders API] Adding authenticated user data');
        orderData.userId = String(session.user.id);
      } else {
        console.log('[Orders API] Adding guest user data');

        // For guest users, we ensure guest email and name are set as strings
        // These fields should always be present due to earlier validation
        if (guestEmail) {
          orderData.guestEmail = String(guestEmail);
          console.log('[Orders API] Set guest email:', orderData.guestEmail);
        } else {
          console.warn('[Orders API] Missing guest email, using fallback');
          orderData.guestEmail = "guest@example.com"; // Fallback value
        }

        if (guestName) {
          orderData.guestName = String(guestName);
          console.log('[Orders API] Set guest name:', orderData.guestName);
        } else {
          console.warn('[Orders API] Missing guest name, using fallback');
          orderData.guestName = "Guest User"; // Fallback value
        }

        // For guest users, we use the guestId from cookies if available
        // but it's optional, so we don't require it
        const guestId = getGuestId();
        if (guestId) {
          console.log('[Orders API] Using guestId from cookie:', guestId);
          orderData.guestId = String(guestId);
        } else {
          console.log('[Orders API] No guestId cookie found, generating a temporary one');
          // Always generate a guestId to avoid null values
          orderData.guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          console.log('[Orders API] Generated temporary guestId:', orderData.guestId);
        }
      }

      console.log('[Orders API] Final order data prepared:', JSON.stringify(orderData));

      // Verify that all required fields are present
      if (!orderData.shippingAddress || !orderData.paymentMethod) {
        console.error('[Orders API] Missing required fields in order data');
        return NextResponse.json(
          { error: "Missing required fields in order data" },
          { status: 400 }
        );
      }

      // Verify that items array is not empty
      if (!orderData.items.create || orderData.items.create.length === 0) {
        console.error('[Orders API] No items in order data');
        return NextResponse.json(
          { error: "No items in order data" },
          { status: 400 }
        );
      }

      // Final safety check for null values in top-level properties
      for (const key in orderData) {
        if (orderData[key] === null || orderData[key] === undefined) {
          console.error(`[Orders API] Null or undefined value detected in ${key}, removing it`);
          delete orderData[key];
        }
      }

      // Create the order in the database
      console.log('[Orders API] Creating order in database');

      try {
        // Final validation to ensure no null values in the order data
        // This is a safety check to prevent the "payload must be of type object" error
        const validateNestedObjects = (obj) => {
          console.log('[Orders API] Validating object:', typeof obj, obj === null ? 'null' : 'not null');

          if (obj === null || obj === undefined) {
            console.log('[Orders API] Object is null or undefined');
            // Instead of returning false, we'll return an empty object to fix the issue
            return {};
          }

          if (typeof obj !== 'object') {
            console.log('[Orders API] Object is not an object type, it is:', typeof obj);
            return true; // Primitive values are fine
          }

          // For arrays, validate each element
          if (Array.isArray(obj)) {
            console.log('[Orders API] Validating array with length:', obj.length);
            // Filter out null values from arrays
            return obj.filter(item => item !== null && item !== undefined).map(item => {
              if (typeof item === 'object') {
                return validateNestedObjects(item) || {};
              }
              return item;
            });
          }

          // Check all properties of the object
          for (const key in obj) {
            const value = obj[key];
            console.log(`[Orders API] Checking property ${key}:`, typeof value, value === null ? 'null' : 'not null');

            if (value === null || value === undefined) {
              console.log(`[Orders API] Property ${key} is null or undefined`);
              // Instead of failing, we'll fix the issue by removing the property
              delete obj[key];
              console.log(`[Orders API] Removed null property ${key}`);
              continue;
            }

            if (typeof value === 'object') {
              const result = validateNestedObjects(value);
              if (result === false) {
                console.log(`[Orders API] Nested object at ${key} is invalid`);
                // Instead of failing, replace with empty object
                obj[key] = {};
                console.log(`[Orders API] Replaced invalid nested object at ${key} with empty object`);
              } else if (result !== true) {
                // If result is an object or array, update the value
                obj[key] = result;
              }
            }
          }

          return obj;
        };

        // Make a deep copy of orderData to avoid modifying the original during validation
        const cleanOrderData = JSON.parse(JSON.stringify(orderData));

        // Apply the validation and cleaning function
        const validatedData = validateNestedObjects(cleanOrderData);

        if (!validatedData || typeof validatedData !== 'object' || Object.keys(validatedData).length === 0) {
          console.error('[Orders API] Order data validation failed:', JSON.stringify(orderData, null, 2));
          return NextResponse.json(
            { error: "Invalid order data: validation failed" },
            { status: 400 }
          );
        }

        // Use the validated and cleaned data for the database operation
        console.log('[Orders API] Using validated order data:', JSON.stringify(validatedData, null, 2));

        // Log the exact data being sent to Prisma
        console.log('[Orders API] Sending data to Prisma:', JSON.stringify(validatedData, null, 2));

        const order = await prisma.order.create({
          data: validatedData,
          include: {
            items: true, // Include the created items in the response
          },
        });

        console.log('[Orders API] Order created successfully with ID:', order.id);
        return NextResponse.json(order);
      } catch (createError) {
        console.error('[Orders API] Error creating order in database:', createError);

        try {
          // Safely log error details
          console.error('[Orders API] Error details:',
            createError ? JSON.stringify(createError, Object.getOwnPropertyNames(createError), 2) : 'No error details');

          if (createError && createError.stack) {
            console.error('[Orders API] Error stack:', createError.stack);
          }
        } catch (logError) {
          console.error('[Orders API] Error while logging error details:', logError);
        }

        // Check for specific error types
        if (createError && createError.code === 'P2002') {
          return NextResponse.json(
            { error: "Unique constraint violation" },
            { status: 400 }
          );
        } else if (createError && createError.code === 'P2003') {
          return NextResponse.json(
            { error: "Foreign key constraint violation. One or more product IDs may be invalid." },
            { status: 400 }
          );
        } else {
          const errorMessage = createError && createError.message
            ? createError.message
            : 'Unknown database error';

          return NextResponse.json(
            { error: `Database error: ${errorMessage}` },
            { status: 500 }
          );
        }
      }
    } catch (dbError) {
      console.error('[Orders API] Database error during order creation:', dbError);

      try {
        // Safely log error details
        if (dbError) {
          console.error('[Orders API] Database error details:',
            JSON.stringify(dbError, Object.getOwnPropertyNames(dbError), 2));

          if (dbError.stack) {
            console.error('[Orders API] Database error stack:', dbError.stack);
          }
        }
      } catch (logError) {
        console.error('[Orders API] Error while logging database error details:', logError);
      }

      const errorMessage = dbError && dbError.message
        ? dbError.message
        : 'Unknown database error';

      return NextResponse.json(
        { error: `Database error: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    try {
      const errorMessage = error instanceof Error ? error.message : (error || "Unknown error occurred");

      console.error("[Orders API] Error during order creation:", errorMessage);

      // Safely log error details
      if (error) {
        if (typeof error === 'object') {
          console.error("[Orders API] Error object:",
            JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        } else {
          console.error("[Orders API] Error value:", error);
        }

        if (error instanceof Error && error.stack) {
          console.error("[Orders API] Error stack:", error.stack);
        }
      }

      return NextResponse.json(
        { error: `Error placing order: ${errorMessage}` },
        { status: 500 }
      );
    } catch (logError) {
      console.error('[Orders API] Fatal error during error handling:', logError);
      return NextResponse.json(
        { error: "A critical error occurred while processing your order" },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let orders = [];

    if (session?.user?.id) {
      // Fetch orders for the logged-in user
      orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Fetch orders for the guest user
      const guestId = getGuestId();

      if (guestId) {
        orders = await prisma.order.findMany({
          where: { guestId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}
