import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { browserId } = await req.json();
    if (!browserId) {
      return NextResponse.json({ error: "Missing browserId" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if this browserId already visited today
    const existingVisit = await prisma.appVisit.findFirst({
      where: {
        browserId,
        date: {
          gte: today,
        },
      },
    });

    if (!existingVisit) {
      await prisma.appVisit.create({
        data: {
          browserId,
          date: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
