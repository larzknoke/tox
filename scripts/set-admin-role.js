#!/usr/bin/env node
// Sets a user's role to admin using Better Auth's admin API.
const path = require("node:path");
const { config } = require("dotenv");
config({ path: path.join(__dirname, "..", ".env") });

const email = process.argv[2] || process.env.EMAIL || "info@larsknoke.com";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Populate it in .env or the environment."
    );
    process.exit(1);
  }

  console.log(`Setting role=admin for ${email}`);

  try {
    // Import - handle the nested default
    const prismaImport = await import("../src/lib/prisma.js");
    const prisma = prismaImport.default.default || prismaImport.default;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (id: ${user.id})`);

    // Update role directly with Prisma (Better Auth API requires HTTP context)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    console.log(
      `✓ User ${email} (id: ${updatedUser.id}) role set to: ${updatedUser.role}`
    );
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
