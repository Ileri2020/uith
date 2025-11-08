"use server";
import { PrismaClient, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Define allowed model names
type ModelName =
  | "cart"
  | "cartItem"
  | "category"
  | "coupon"
  | "featuredProduct"
  | "notification"
  | "payment"
  | "post"
  | "product"
  | "refund"
  | "review"
  | "shippingAddress"
  | "stock"
  | "user";

const modelMap: Record<ModelName, any> = {
  cart: prisma.cart,
  cartItem: prisma.cartItem,
  category: prisma.category,
  coupon: prisma.coupon,
  featuredProduct: prisma.featuredProduct,
  notification: prisma.notification,
  payment: prisma.payment,
  post: prisma.post,
  product: prisma.product,
  refund: prisma.refund,
  review: prisma.review,
  shippingAddress: prisma.shippingAddress,
  stock: prisma.stock,
  user: prisma.user,
};

// Utility to safely get Prisma model
function getModel(name: string | null) {
  if (!name || !(name in modelMap)) return null;
  return modelMap[name as ModelName];
}

// Helper for consistent JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ✅ GET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("model");
  const idParam = searchParams.get("id");

  const prismaModel = getModel(modelName);
  if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

  try {
    if (!idParam) {
      // Handle review/post relations
      if (modelName === "review" || modelName === "post") {
        const items = await prismaModel.findMany();
        const userIds = items.map((i: any) => i.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true, avatarUrl: true },
        });

        const result = items.map((item: any) => ({
          ...item,
          user: users.find((u:any) => u.id === item.userId),
        }));

        return jsonResponse(result);
      }

      const items = await prismaModel.findMany();
      return jsonResponse(items);
    }

    // If idParam exists
    if (modelName === "review") {
      const items = await prismaModel.findMany({
        where: { contentId: idParam },
      });
      return jsonResponse(items);
    }

    const item = await prismaModel.findUnique({
      where: { id: idParam },
    });

    if (!item) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(item);
  } catch (error) {
    console.error("Database error:", error);
    return jsonResponse({ error: "Failed to fetch items" }, 500);
  }
}

// ✅ POST
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("model");
  const prismaModel = getModel(modelName);
  if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  try {
    if (modelName === "user") {
      const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);
      body.password = hashedPassword;
    }

    const newItem = await prismaModel.create({ data: body });
    return jsonResponse(newItem, 201);
  } catch (error) {
    console.error("Database error:", error);
    return jsonResponse({ error: "Failed to create item" }, 500);
  }
}

// ✅ PUT
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("model");
  const prismaModel = getModel(modelName);
  if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  const { id, ...updateData } = body;
  if (!id) return jsonResponse({ message: "Missing id" }, 400);

  try {
    const updated = await prismaModel.update({
      where: { id },
      data: updateData,
    });
    return jsonResponse(updated);
  } catch (error) {
    console.error("Database update error:", error);
    return jsonResponse({ error: "Failed to update item" }, 500);
  }
}

// ✅ DELETE
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("model");
  const idParam = searchParams.get("id");

  const prismaModel = getModel(modelName);
  if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);
  if (!idParam) return jsonResponse({ message: "Missing id" }, 400);

  try {
    await prismaModel.delete({ where: { id: idParam } });
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Database DELETE error:", error);
    return jsonResponse({ error: "Failed to delete item" }, 500);
  }
}
