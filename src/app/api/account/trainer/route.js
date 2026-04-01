import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        trainer: true,
      },
    });
    if (!user || !user.trainer) {
      return Response.json({ trainer: null });
    }

    return Response.json({ trainer: user.trainer });
  } catch (error) {
    console.error("Error fetching trainer:", error);
    return Response.json({ error: "Failed to fetch trainer" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trainerId } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trainerId: trainerId,
      },
      include: {
        trainer: true,
      },
    });

    return Response.json({ trainer: user.trainer || null });
  } catch (error) {
    console.error("Error updating trainer:", error);
    return Response.json(
      { error: "Failed to update trainer" },
      { status: 500 }
    );
  }
}
