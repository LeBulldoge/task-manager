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
    <main className="container flex min-h-screen min-w-full flex-col items-center justify-center">
      <div className="mb-24 text-5xl">Task table</div>
      <div className="flex">
        <div className="flex justify-center bg-slate-600">
          <div className="peer sticky top-0 flex flex-col py-3 px-2">
            <button className="h-8 w-8 rounded border border-slate-500 text-center">
              S
            </button>
          </div>
          <div className="min-h-screen w-0 border-x border-x-slate-500 py-2 opacity-0 drop-shadow-2xl transition-all duration-75 ease-in hover:w-96 hover:px-2 hover:opacity-100 peer-hover:w-96 peer-hover:px-2 peer-hover:opacity-100 peer-hover:duration-150 group">
            <strong className="text-xl">Status List</strong>
            <ul className="list-inside list-disc">
              {list.map((status, index) => {
                return (
                  <li
                    key={index}
                    className="mb-4 border-b border-b-slate-500 text-slate-300"
                  >
                    <input
                      type="text"
                      defaultValue={status}
                      className="bg-inherit text-white"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <table className="mb-auto w-full table-fixed overflow-y-auto bg-slate-500">
          <thead className="sticky top-0 z-10 bg-slate-600 uppercase">
            <tr className="table-row">
              {list.map((status) => {
                return (
                  <th key={status} className="py-3 px-6">
                    {status}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {list.map((status) => {
                return (
                  <td key={status} id={status} className="align-top">
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
