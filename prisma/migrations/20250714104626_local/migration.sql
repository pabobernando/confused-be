/*
  Warnings:

  - The primary key for the `TournamentParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `TournamentParticipant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "payment_quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("id");
