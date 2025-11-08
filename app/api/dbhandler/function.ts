import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const modelMap = {
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

type ModelName = keyof typeof modelMap;
type Method = "GET" | "POST" | "PUT" | "DELETE";

interface DbHandlerParams {
  model: ModelName;
  id?: string | null;
  body?: Record<string, any> | null;
  method: Method;
  profileImage?: boolean;
}

interface DbResponse {
  status: number;
  data: unknown;
}

async function dbHandler({
  model,
  id,
  body = null,
  method,
  profileImage = false,
}: DbHandlerParams): Promise<DbResponse> {
  console.log("In dbHandler function");

  const prismaModel = modelMap[model];
  if (!prismaModel) {
    return { status: 400, data: { message: "Invalid model" } };
  }

  try {
    switch (method) {
      // ✅ READ
      case "GET": {
        if (id) {
          const item = await prismaModel.findUnique({
            where: { id } as any, // casting since each model can have a different id type
          });
          if (!item) {
            return { status: 404, data: { error: "Document not found" } };
          }
          return { status: 200, data: item };
        } else {
          const items = await prismaModel.findMany();
          return { status: 200, data: items };
        }
      }

      // ✅ CREATE
      case "POST": {
        if (!body) {
          return { status: 400, data: { error: "Missing body" } };
        }

        const newItem = await prismaModel.create({
          data: body as any,
        });

        // Optional profile image update
        if (profileImage && model === "post" && body.userId && body.url) {
          try {
            console.log("Updating user profile image");
            await prisma.user.update({
              where: { id: body.userId },
              data: { avatarUrl: body.url },
            });
          } catch (error) {
            console.error("Database error:", error);
            return {
              status: 500,
              data: { error: "Failed to update user profile image" },
            };
          }
        }

        return { status: 200, data: newItem };
      }

      // ✅ UPDATE
      case "PUT": {
        if (!body || !("id" in body)) {
          return { status: 400, data: { error: "Missing id in body" } };
        }

        const { id: itemId, ...updateData } = body;
        const updatedItem = await prismaModel.update({
          where: { id: itemId } as any,
          data: updateData as any,
        });

        return { status: 200, data: updatedItem };
      }

      // ✅ DELETE
      case "DELETE": {
        if (!id) {
          return { status: 400, data: { error: "Missing id" } };
        }

        await prismaModel.delete({
          where: { id } as any,
        });

        return { status: 200, data: { success: true } };
      }

      default:
        return { status: 405, data: { error: "Method not allowed" } };
    }
  } catch (error) {
    console.error("Database error:", error);
    return { status: 500, data: { error: "Failed to perform operation" } };
  }
}

export default dbHandler;
