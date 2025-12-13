-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "plan" "SubscriptionPlan" NOT NULL DEFAULT 'PREMIUM';
