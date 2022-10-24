import type { NextPage } from "next";
import { MouseEvent, useState } from "react";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskForm } from "@/components/TaskForm";
import { trpc } from "@/utils/trpc";
import { Task } from "@prisma/client";
import Image from "next/future/image";

const Home: NextPage = () => {
  const [dragged, setDragged] = useState<HTMLElement | null>(null);

  const tasks = trpc.tasks.getAll.useQuery();
  const createTask = trpc.tasks.createTask.useMutation();

  const handleAddTask = (e: MouseEvent, status: string) => {
    const element = e.target as HTMLElement;
    const attrs = element.getAttribute("class");

    createTask.mutateAsync({ name: "New task", status: status }).then(() => {
      tasks.refetch();
      element.setAttribute("class", attrs!);
    });

    element.setAttribute("class", attrs + " animate-pulse");
  };

  const handleUpdateTask = (task: Task) => {
    tasks.refetch();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-4 text-5xl">Table of doom</div>
      <table className="mx-10 mb-auto table-fixed overflow-y-auto bg-slate-500">
        <thead className="bg-slate-600 uppercase">
          <tr className="table-row">
            <th className="py-3 px-6">Created</th>
            <th className="py-3 px-6">In-progress</th>
            <th className="py-3 px-6">Finished</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td id="created" className="align-top">
              <Dropzone
                dragged={dragged}
                className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
              >
                {tasks.data
                  ?.filter((task) => task.status == "created")
                  .map((task) => {
                    return (
                      <Draggable key={task.id} setDragged={setDragged}>
                        <TaskForm
                          task={task}
                          updateHandler={handleUpdateTask}
                        />
                      </Draggable>
                    );
                  })}
                <div
                  onClick={(e) => handleAddTask(e, "created")}
                  className="h-36 w-36 rounded-xl border-2 border-dashed border-slate-600 text-center text-7xl text-slate-600 hover:cursor-pointer hover:bg-slate-400"
                >
                  +
                </div>
              </Dropzone>
            </td>

            <td
              id="in-progress"
              className="border-x-2 border-slate-600 align-top"
            >
              <Dropzone
                className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
                dragged={dragged}
              >
                {tasks.data
                  ?.filter((task) => task.status == "in-progress")
                  .map((task) => {
                    return (
                      <Draggable key={task.id} setDragged={setDragged}>
                        <TaskForm
                          task={task}
                          updateHandler={handleUpdateTask}
                        />
                      </Draggable>
                    );
                  })}
                <div
                  onClick={(e) => handleAddTask(e, "in-progress")}
                  className="h-36 w-36 rounded-xl border-2 border-dashed border-slate-600 text-center text-7xl text-slate-600 hover:cursor-pointer hover:bg-slate-400"
                >
                  +
                </div>
              </Dropzone>
            </td>

            <td id="finished" className="align-top">
              <Dropzone
                className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
                dragged={dragged}
              >
                {tasks.data
                  ?.filter((task) => task.status == "finished")
                  .map((task) => {
                    return (
                      <Draggable key={task.id} setDragged={setDragged}>
                        <TaskForm
                          task={task}
                          updateHandler={handleUpdateTask}
                        />
                      </Draggable>
                    );
                  })}
                <div
                  onClick={(e) => handleAddTask(e, "finished")}
                  className="h-36 w-36 rounded-xl border-2 border-dashed border-slate-600 text-center text-7xl text-slate-600 hover:cursor-pointer hover:bg-slate-400"
                >
                  +
                </div>
              </Dropzone>
            </td>
          </tr>
        </tbody>
      </table>
      <a
        href="https://github.com/LeBulldoge/task-manager"
        className="sticky bottom-0 flex gap-1 place-self-end pr-3 pb-1 text-xs text-slate-300 hover:underline group"
      >
        <Image
          src="/GitHub-Mark-Light-32px.png"
          width={16}
          height={16}
          alt="GitHub Logo"
          className="group-hover:animate-spin"
        />
        GitHub
      </a>
    </div>
  );
};

export default Home;
