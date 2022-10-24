import { router, publicProcedure } from "@/server/trpc/trpc";
import { z } from "zod";

export const taskRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany();
  }),

  createTask: publicProcedure
    .input(z.object({ name: z.string(), status: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.create({
        data: { name: input.name, status: input.status },
      });
    }),

  updateTask: publicProcedure
    .input(z.object({ id: z.string(), name: z.string(), status: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          status: input.status,
        },
      });
    }),
});
