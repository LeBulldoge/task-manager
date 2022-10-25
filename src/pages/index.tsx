import type { NextPage } from "next";
import { useState } from "react";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskForm } from "@/components/TaskForm";
import { trpc } from "@/utils/trpc";
import { Task } from "@prisma/client";
import Image from "next/future/image";
import { AddButton } from "@/components/AddButton";

const Home: NextPage = () => {
  const [dragged, setDragged] = useState<HTMLElement | null>(null);
  const [isAddingCell, setIsAddingCell] = useState(false);

  const list = ["created", "in-progress", "finished"];

  const tasks = trpc.tasks.getAll.useQuery();
  const createTask = trpc.tasks.createTask.useMutation();

  const handleAddTask = (status: string) => {
    if (isAddingCell) return;

    createTask.mutateAsync({ name: "New task", status: status }).then(() => {
      tasks.refetch();
      setIsAddingCell(false);
    });

    setIsAddingCell(true);
  };

  const handleUpdateTask = (task: Task) => {
    tasks.refetch();
  };

  return (
    <main className="container min-w-full flex min-h-screen flex-col items-center justify-center">
      <div className="mb-24 text-5xl">Task table</div>
      <div className="flex">
        <div className="z-20 flex w-12 flex-col py-3 px-2 items-center bg-slate-600">
          <div className="flex sticky top-0">
            <button className="peer h-6 w-6 bg-slate-300 text-center">+</button>
            <div className="absolute -z-10 w-96 min-h-screen -translate-x-96 rounded border border-slate-500 border-l-slate-600 bg-slate-600 p-2 opacity-0 drop-shadow-2xl transition ease-in-out hover:translate-x-8 hover:opacity-100 peer-hover:translate-x-8 peer-hover:opacity-100">
              {list.map((status) => {
                return <p>{status}</p>;
              })}
            </div>
          </div>
        </div>
        <table className="mb-auto w-full table-fixed overflow-y-auto bg-slate-500">
          <thead className="sticky top-0 z-10 bg-slate-600 uppercase">
            <tr className="table-row">
              {list.map((status) => {
                return <th className="py-3 px-6">{status}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {list.map((status) => {
                return (
                  <td id={status} className="align-top">
                    <Dropzone
                      dragged={dragged}
                      className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
                    >
                      {tasks.data
                        ?.filter((task) => task.status == status)
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
                      <AddButton
                        disabled={isAddingCell}
                        onClick={() => handleAddTask(status)}
                      />
                    </Dropzone>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <a
        href="https://github.com/LeBulldoge/task-manager"
        className="group fixed bottom-0 flex gap-1 place-self-end pr-3 pb-1 text-xs text-slate-300 hover:underline"
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
    </main>
  );
};

export default Home;
