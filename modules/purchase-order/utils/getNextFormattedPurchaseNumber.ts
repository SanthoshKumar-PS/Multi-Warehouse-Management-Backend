import { Prisma, PrismaClient } from "@prisma/client";
export async function getNextFormattedPurchaseNumber(tx: PrismaClient | Prisma.TransactionClient, vr2PurchaseDate: string): Promise<string> {
  const lastPurchaseOrder = await tx.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: vr2PurchaseDate,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;
  if (lastPurchaseOrder) {
    const lastNum = parseInt(lastPurchaseOrder.poNumber.split("-")[3]);
    nextNumber = lastNum + 1;
  }

  const formattedNumber = nextNumber.toString().padStart(2, "0");
  return formattedNumber;
}
