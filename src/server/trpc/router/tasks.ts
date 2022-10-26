import { router, publicProcedure } from "@/server/trpc/trpc";
import type { Task } from "@prisma/client";
import { z } from "zod";

const schemaForType =
  <T>() =>
  <S extends z.ZodType<T, any, any>>(arg: S) => {
    return arg;
  };

const taskInputSchema = schemaForType<Partial<Task>>()(
  z.object({
    id: z.number().optional(),
    name: z.string(),
    statusId: z.number(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
);

export const taskRouter = router({
  getAllTasks: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany();
  }),

  getAllStatuses: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.status.findMany();
  }),

  createTask: publicProcedure.input(taskInputSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.task.create({
      data: { name: input.name, statusId: input.statusId },
    });
  }),

  updateTask: publicProcedure.input(taskInputSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.task.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        statusId: input.statusId,
      },
    });
  }),

  deleteTask: publicProcedure
    .input(z.object({ where: z.object({ id: z.number() }) }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.delete({
        where: input.where,
      });
    }),
});
