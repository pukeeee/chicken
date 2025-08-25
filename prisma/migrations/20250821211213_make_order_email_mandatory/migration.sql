-- AlterTable
-- Step 1: Add the column as nullable
ALTER TABLE "Order" ADD COLUMN "customerEmail" TEXT;

-- Step 2: Update existing rows with a placeholder value
UPDATE "Order" SET "customerEmail" = 'placeholder@example.com' WHERE "customerEmail" IS NULL;

-- Step 3: Alter the column to be non-nullable
ALTER TABLE "Order" ALTER COLUMN "customerEmail" SET NOT NULL;