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
    description: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

const taskCreateSchema: z.ZodType<Prisma.TaskCreateArgs> = z.object({
  data: z.object({
    name: z.string(),
    statusId: z.number(),
    description: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

const taskDeleteSchema: z.ZodType<Prisma.TaskDeleteArgs> = z.object({
  where: z.object({
    id: z.number(),
  }),
});

const statusCreateSchema: z.ZodType<Prisma.StatusCreateArgs> = z.object({
  data: z.object({
    name: z.string(),
    order: z.number(),
  }),
});

const statusUpdateSchema: z.ZodType<Prisma.StatusUpdateArgs> = z.object({
  where: z.object({
    id: z.number(),
  }),
  data: z.object({
    name: z.string().optional(),
    order: z.number().optional(),
  }),
});

const statusDeleteSchema: z.ZodType<Prisma.StatusDeleteArgs> = z.object({
  where: z.object({
    id: z.number(),
  }),
});

export const taskRouter = router({
  getAllTasks: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany({
      include: {
        parentOf: {
          select: {
            type: true,
            child: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        childOf: {
          select: {
            type: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }),

  getTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.task.findUnique({
        where: {
          ...input,
        },
        include: {
          parentOf: true,
          childOf: true,
        },
      });
    }),

  createTask: publicProcedure
    .input(taskCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.create(input);
    }),

  addLink: publicProcedure
    .input(
      z.object({ parentId: z.number(), childId: z.number(), type: z.string() })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.link.create({
        data: {
          ...input,
        },
      });
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

  getAllStatuses: publicProcedure
    .query(({ ctx }) => {
      return ctx.prisma.status.findMany();
    }),

  createStatus: publicProcedure
    .input(statusCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.status.create(input);
    }),

  updateStatus: publicProcedure
    .input(statusUpdateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.status.update(input);
    }),

  deleteStatus: publicProcedure
    .input(statusDeleteSchema)
    .mutation(({ ctx, input }) => {
      const res = ctx.prisma.task
        .deleteMany({
          where: {
            statusId: input.where.id,
          },
        })
        .then(() => ctx.prisma.status.delete(input));
      return res;
    }),
});

export type TaskRouter = typeof taskRouter;
