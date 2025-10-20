-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "blogType" TEXT;

-- AlterTable
ALTER TABLE "Cooking" ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;
