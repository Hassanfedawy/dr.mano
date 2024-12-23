
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export async function PUT(req, { params }) {
    const { id } = params;
    try {
      const data = await req.json();
  
      // Validate password if updating
      if (data.password && data.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
      }
  
      const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
  
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          password: hashedPassword ? hashedPassword : undefined
        },
      });
  
      const { password, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword);
    } catch (error) {
      console.error("User update error:", error.message, error.stack);
      return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
  }
  
  
  // Backend: /api/admin/users/[id].js
  
  export async function DELETE(req, { params }) {
    const { id } = params; // Get userId from URL params
    try {
      // Perform the deletion
      await prisma.user.delete({
        where: { id },
      });
  
      return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response(JSON.stringify({ error: "Error deleting user" }), { status: 500 });
    }
  }