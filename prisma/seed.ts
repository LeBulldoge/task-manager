import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const created = await prisma.status.upsert({
    where: {
      name: "Created",
    },
    update: {},
    create: {
      name: "Created",
      tasks: {
        create: {
          name: "Task A",
        },
      },
    },
  });

  const inProgress = await prisma.status.upsert({
    where: {
      name: "In-progress",
    },
    update: {},
    create: {
      name: "In-progress",
      tasks: {
        create: {
          name: "Task B",
        },
      },
    },
  });

  const finished = await prisma.status.upsert({
    where: {
      name: "Finished"
    },
    update: {},
    create: {
      name: "Finished",
      tasks: {
        create: {
          name: "Task C",
        },
      },
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
