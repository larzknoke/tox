-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";
ALTER TABLE "orders" DROP CONSTRAINT "orders_billingAddressId_fkey";
ALTER TABLE "orders" DROP CONSTRAINT "orders_deliveryAddressId_fkey";
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_orderId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_billingAddressId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_deliveryAddressId_fkey";

-- DropIndex
DROP INDEX "orders_orderNumber_key";

-- Drop order_items (will be recreated)
DROP TABLE "order_items";

-- Drop invoices (will be recreated)
DROP TABLE "invoices";

-- Drop orders (will be recreated)
DROP TABLE "orders";

-- Drop products (will be recreated)
DROP TABLE "products";

-- Recreate addresses with Int id
-- First remove FK references from users
ALTER TABLE "users" DROP COLUMN "billingAddressId";
ALTER TABLE "users" DROP COLUMN "deliveryAddressId";

-- Drop and recreate addresses with integer PK
DROP TABLE "addresses";

CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Add back user address columns with Int type
ALTER TABLE "users" ADD COLUMN "billingAddressId" INTEGER;
ALTER TABLE "users" ADD COLUMN "deliveryAddressId" INTEGER;

-- CreateTable products
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerPack" DECIMAL(10,2) NOT NULL,
    "quantityPerPack" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable orders
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "billingAddressId" INTEGER NOT NULL,
    "deliveryAddressId" INTEGER NOT NULL,
    "confirmationEmailSentAt" TIMESTAMP(3),
    "invoiceEmailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable order_items
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantityPerPack" INTEGER NOT NULL,
    "numberOfPacks" INTEGER NOT NULL,
    "pricePerPack" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable invoices
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_reference_key" ON "products"("reference");
CREATE UNIQUE INDEX "users_billingAddressId_key" ON "users"("billingAddressId");
CREATE UNIQUE INDEX "users_deliveryAddressId_key" ON "users"("deliveryAddressId");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE UNIQUE INDEX "invoices_orderId_key" ON "invoices"("orderId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
