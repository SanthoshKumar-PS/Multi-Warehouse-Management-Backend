import prisma from "../../../utils/prisma";

export const findUserByTrigram = (trigram: string) => {
  return prisma.user.findUnique({
    where: {
      trigram,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
      warehouses: {
        include: {
          warehouse: true,
        },
      },
    },
  });
};
