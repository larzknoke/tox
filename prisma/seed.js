import "dotenv/config";
import { runWithEndpointContext } from "@better-auth/core/context";
import { auth } from "../src/lib/auth.js";
import prisma from "../src/lib/prisma.js";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@larsknoke.com";

async function main() {
  try {
    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingUser) {
      console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
      await prisma.$disconnect();
      return;
    }

    console.log("📊 Creating initial admin user...");

    const authContext = await auth.$context;
    const endpointCtx = { context: authContext };

    await runWithEndpointContext(endpointCtx, async () => {
      // Hash password
      const hashedPassword = await authContext.password.hash("ChangeMe123!");

      // Create admin user
      const adminUser = await authContext.internalAdapter.createUser({
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "admin",
        emailVerified: true,
      });

      // Create account with password
      await authContext.internalAdapter.createAccount({
        accountId: ADMIN_EMAIL,
        providerId: "credential",
        userId: adminUser.id,
        password: hashedPassword,
      });

      console.log(
        `✓ Admin user created: ${adminUser.email} (id: ${adminUser.id})`
      );
      console.log(`⚠️  Default password: ChangeMe123! - Please change it!`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    await prisma.$disconnect();
    throw error;
  }
}

main();
