-- CreateTable
CREATE TABLE "Cooking" (
    "id" TEXT NOT NULL,
    "dishName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ingredients" TEXT[],
    "cookDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cooking_pkey" PRIMARY KEY ("id")
);
