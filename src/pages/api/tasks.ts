import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";

const tasks = async (req: NextApiRequest, res: NextApiResponse) => {
  const tasks = await prisma.task.findMany();
  res.status(200).json(tasks);
};

export default tasks;
