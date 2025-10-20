/*
  Warnings:

  - You are about to alter the column `rating` on the `Cooking` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Cooking" ALTER COLUMN "rating" SET DEFAULT 5,
ALTER COLUMN "rating" SET DATA TYPE INTEGER,
ALTER COLUMN "ingredients" SET DEFAULT ARRAY[]::TEXT[];
