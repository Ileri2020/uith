// @ts-nocheck
"use server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// --- 1️⃣ Extend the allowed model names -------------------------------------------------
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
  | "user"
  | "form"
  | "formField"
  | "conversation"
  | "message"
  | "appointment"
  | "prescription"
  | "appVisit"
  | "post"
  | "notification";

// --- 2️⃣ Map every model to its Prisma client property -------------------------------
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
  form: prisma.form,
  formField: prisma.formField,
  conversation: prisma.conversation,
  message: prisma.message,
  appointment: prisma.appointment,
  admission: prisma.admission,
  room: prisma.room,
  department: prisma.department,
  prescription: prisma.prescription,
  appVisit: prisma.appVisit,
};

// --- 3️⃣ Helper to get the correct Prisma model ---------------------------------------
function getModel(name: string | null) {
  if (!name || !(name in modelMap)) return null;
  return modelMap[name as ModelName];
}

// --- 4️⃣ JSON response helper ---------------------------------------------------------
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

















// --- 5️⃣ GET ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const modelName = searchParams.get('model')
  const idParam = searchParams.get('id')
  const role = searchParams.get('role')
  const orderBy = searchParams.get('orderBy')
  const orderDir = searchParams.get('orderDir')?.toLowerCase() === 'asc' ? 'asc' : 'desc'
  const patientId = searchParams.get('patient-id')
  const medicalStaffId = searchParams.get("medical_staff_id")

  const prismaModel = getModel(modelName)
  if (!prismaModel) return jsonResponse({ message: 'Invalid model' }, 400)

  try {
    // ==========================
    // LIST QUERY (NO ID)
    // ==========================
    if (!idParam) {
      const where: any = {}

      // Map all search params to where clause (except special ones)
      searchParams.forEach((val, key) => {
        if (!['model', 'id', 'orderBy', 'orderDir', 'patient-id'].includes(key)) {
          // Check if it's an ID field that should be an ObjectId
          if (key.endsWith('Id') || key === 'patient_id' || key === 'medical_staff_id' || key === 'appointmentId') {
            where[key] = val
          } else {
            where[key] = val
          }
        }
      })

      // Handle legacy dash param
      if (patientId) where.patient_id = patientId

      const orderByClause: any = {}
      if (orderBy) orderByClause[orderBy] = orderDir

      // Model-specific logic
      if (modelName === 'appointment') {
        const items = await prismaModel.findMany({
          where,
          orderBy: orderByClause,
          include: {
            patient: true,
            medical_staff: true,
            form: true,
            answers_forms: true,
            prescriptions: true,
            conversation: true,
          },
        })
        return jsonResponse(items)
      }

      if (modelName === 'prescription') {
        const items = await prismaModel.findMany({
          where,
          orderBy: orderByClause,
          include: {
            creator: true,
            pharmacist: true,
            patient: true,
          }
        })
        return jsonResponse(items)
      }

      if (modelName === 'formField') {
        const items = await prismaModel.findMany({
          where,
          orderBy: orderByClause,
          include: {
            form: true,
            recipient: true,
            appointment: { include: { medical_staff: true } }
          }
        })
        return jsonResponse(items)
      }

      if (modelName === 'post') {
        const items = await prismaModel.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { author: true }
        })
        return jsonResponse(items)
      }

      // Default
      const items = await prismaModel.findMany({
        where,
        orderBy: orderByClause,
      })
      return jsonResponse(items)
    }

    // ==========================
    // GET BY ID
    // ==========================
    const item = await prismaModel.findUnique({
      where: { id: idParam },
    })
    if (!item) return jsonResponse({ error: 'Document not found' }, 404)

    return jsonResponse(item)

  } catch (error) {
    console.error('Database error:', error)
    return jsonResponse({ error: 'Failed to fetch items' }, 500)
  }
}




// --- ⿦ POST -------------------------------------------------------------------------- 
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
    if (modelName === 'appointment') {
      // Create a conversation for the appointment if it's new
      const newItem = await prismaModel.create({ data: body });
      await prisma.conversation.create({
        data: {
          appointmentId: newItem.id,
          patientId: newItem.patient_id,
        }
      });
      return jsonResponse(newItem, 201);
    } else if (modelName === 'formField') {
      // Check if form field already exists for appointment
      const existingFormField = await prisma.formField.findFirst({
        where: {
          appointmentId: body.appointmentId,
          formId: body.formId,
        },
      });

      if (existingFormField) {
        // Update existing form field
        const updatedFormField = await prisma.formField.update({
          where: { id: existingFormField.id },
          data: body,
        });
        return jsonResponse(updatedFormField, 200);
      } else {
        // Create new form field
        const newFormField = await prismaModel.create({ data: body });
        return jsonResponse(newFormField, 201);
      }
    } else {
      const newItem = await prismaModel.create({ data: body });
      return jsonResponse(newItem, 201);
    }
  } catch (error) {
    console.error("Database error:", error);
    return jsonResponse({ error: "Failed to create item" }, 500);
  }
}




// --- ⿧ PUT --------------------------------------------------------------------------- 
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("model");
  const prismaModel = getModel(modelName);
  if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  try {
    if (modelName === 'appointment') {
      // Handle appointment update
      const { id, form, ...updateData } = body;
      if (!id) return jsonResponse({ message: "Missing id" }, 400);
      const updatedAppointment = await prismaModel.update({
        where: { id },
        data: updateData,
      });
      return jsonResponse(updatedAppointment);
    } else if (modelName === 'formField') {
      // Update form field
      const { id, ...updateData } = body;
      if (!id) return jsonResponse({ message: "Missing id" }, 400);
      const updatedFormField = await prismaModel.update({
        where: { id },
        data: updateData,
      });
      return jsonResponse(updatedFormField);
    } else {
      // Handle other models
      const { id, ...updateData } = body;
      if (!id) return jsonResponse({ message: "Missing id" }, 400);
      const updated = await prismaModel.update({
        where: { id },
        data: updateData,
      });
      return jsonResponse(updated);
    }
  } catch (error) {
    console.error("Database update error:", error);
    return jsonResponse({ error: "Failed to update item" }, 500);
  }
}



// --- 8️⃣ DELETE -------------------------------------------------------------------------
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




























// // --- 6️⃣ POST --------------------------------------------------------------------------
// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const modelName = searchParams.get("model");
//   const prismaModel = getModel(modelName);

//   if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

//   let body: any;
//   try {
//     body = await req.json();
//   } catch {
//     return jsonResponse({ message: "Invalid JSON" }, 400);
//   }

//   try {
//     if (modelName == "user") {
//       const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
//       const hashedPassword = await bcrypt.hash(body.password, saltRounds);
//       body.password = hashedPassword;
//     }

//     const newItem = await prismaModel.create({ data: body });
//     return jsonResponse(newItem, 201);
//   } catch (error) {
//     console.error("Database error:", error);
//     return jsonResponse({ error: "Failed to create item" }, 500);
//   }
// }

// // --- 7️⃣ PUT ---------------------------------------------------------------------------

// export async function PUT(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const modelName = searchParams.get("model");
//   const prismaModel = getModel(modelName);

//   if (!prismaModel) return jsonResponse({ message: "Invalid model" }, 400);

//   let body;
//   try {
//     body = await req.json();
//   } catch {
//     return jsonResponse({ message: "Invalid JSON" }, 400);
//   }

//   try {
//     if (modelName === 'appointment') {
//       // Handle appointment update
//       const { id, form, ...updateData } = body;
//       if (!id) return jsonResponse({ message: "Missing id" }, 400);

//       const updatedAppointment = await prismaModel.update({
//         where: { id },
//         data: updateData,
//       });

//       if (form) {
//         await prisma.form.update({
//           where: { id: form.id },
//          data: { fields: form.fields }
//         });
//       }

//       return jsonResponse(updatedAppointment);
//     } else {
//       // Handle other models
//       const { id, ...updateData } = body;
//       if (!id) return jsonResponse({ message: "Missing id" }, 400);

//       const updated = await prismaModel.update({
//         where: { id },
//         data: updateData,
//       });

//       return jsonResponse(updated);
//     }
//   } catch (error) {
//     console.error("Database update error:", error);
//     return jsonResponse({ error: "Failed to update item" }, 500);
//   }
// }