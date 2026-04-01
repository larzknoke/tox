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

    const trainers = await prisma.trainer.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({ trainers });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return Response.json(
      { error: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}
