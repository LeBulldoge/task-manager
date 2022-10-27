import { router, publicProcedure } from "@/server/trpc/trpc";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const taskUpdateSchema: z.ZodType<Prisma.TaskUpdateArgs> = z.object({
  where: z.object({
    id: z.number(),
  }),
  data: z.object({
    name: z.string().optional(),
    statusId: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

const taskCreateSchema: z.ZodType<Prisma.TaskCreateArgs> = z.object({
  data: z.object({
    name: z.string(),
    statusId: z.number(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

const taskDeleteSchema: z.ZodType<Prisma.TaskDeleteArgs> = z.object({
  where: z.object({
    id: z.number().optional(),
  }),
});

export const taskRouter = router({
  getAllTasks: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany();
  }),

  getAllStatuses: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.status.findMany();
  }),

  createTask: publicProcedure
    .input(taskCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.create(input);
    }),

  updateTask: publicProcedure
    .input(taskUpdateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.update(input);
    }),

  deleteTask: publicProcedure
    .input(taskDeleteSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.delete(input);
    }),
});
