import { Prisma, PrismaClient } from "@prisma/client";
export async function getNextFormattedTransferNumber(tx: PrismaClient | Prisma.TransactionClient, vr2TransferDate: string): Promise<string> {
  const lastTransferOrder = await tx.transferOrder.findFirst({
    where: {
      transferNo: {
        startsWith: vr2TransferDate,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;
  if (lastTransferOrder) {
    const lastNum = parseInt(lastTransferOrder.transferNo.split("-")[3]);
    nextNumber = lastNum + 1;
  }

  const formattedNumber = nextNumber.toString().padStart(2, "0");
  return formattedNumber;
}
