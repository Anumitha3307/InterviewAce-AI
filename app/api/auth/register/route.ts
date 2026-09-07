import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name cannot exceed 100 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain alphanumeric characters and underscores"
    ),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message ?? "Invalid input data";
      return NextResponse.json(
        {
          success: false,
          error: firstError,
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, username, email, password } = validation.data;

    // Check if email already exists (case-insensitive)
    const existingEmail = await db.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists",
        },
        { status: 409 }
      );
    }

    // Check if username already exists (case-insensitive)
    const existingUsername = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: "This username is already taken",
        },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const newUser = await db.user.create({
      data: {
        name: fullName,
        username,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
