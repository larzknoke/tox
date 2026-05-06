import { getDpdAuthToken } from "@/lib/dpd";

export async function POST() {
  try {
    const { authToken, result } = await getDpdAuthToken();

    return Response.json({ authToken, result });
  } catch (err) {
    console.error("DPD Login Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
