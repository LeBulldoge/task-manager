import type { NextPage } from "next";
import { useState } from "react";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskForm } from "@/components/TaskForm";
import { trpc } from "@/utils/trpc";
import { Task } from "@prisma/client";
import Image from "next/future/image";
import { AddButton } from "@/components/AddButton";

const Home: NextPage = () => {
  const [currentlyDragged, setCurrentlyDragged] = useState<HTMLElement | null>(
    null
  );
  const [isAddingCell, setIsAddingCell] = useState(false);

  const tasks = trpc.tasks.getAllTasks.useQuery();
  const statuses = trpc.tasks.getAllStatuses.useQuery();
  const createTask = trpc.tasks.createTask.useMutation();

  const handleAddTask = (status: number) => {
    if (isAddingCell) return;

    createTask.mutateAsync({ name: "New task", statusId: status }).then(() => {
      tasks.refetch();
      setIsAddingCell(false);
    });

    setIsAddingCell(true);
  };

  const handleUpdateTask = (task: Task) => {
    tasks.refetch();
  };

  return (
    <>
      <head>
        <title>Task Manager</title>
        <meta name="description" content="WIP task manager web application" />
      </head>

      <main className="container flex min-h-screen min-w-full flex-col items-center justify-center">
        <div className="flex">
          <div className="flex justify-center bg-slate-600">
            <div className="peer sticky top-0 flex flex-col place-self-start py-3 px-2">
              <button className="h-8 w-8 rounded border border-slate-500 text-center">
                S
              </button>
            </div>
            <div className="group sticky top-0 min-h-screen w-0 place-self-start border-x border-x-slate-500 py-2 opacity-0 drop-shadow-2xl transition-all duration-75 ease-in hover:w-96 hover:px-2 hover:opacity-100 peer-hover:w-96 peer-hover:px-2 peer-hover:opacity-100 peer-hover:duration-150">
              <strong className="text-xl">Status List</strong>
              <ul className="list-inside list-disc">
                {statuses.data?.map((status) => {
                  return (
                    <li
                      key={status.id.toString()}
                      className="mb-4 border-b border-b-slate-500 text-slate-300"
                    >
                      <input
                        type="text"
                        defaultValue={status.name}
                        className="bg-inherit text-white"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <table className="mb-auto w-full table-fixed overflow-y-auto bg-slate-500">
            <thead className="sticky top-0 z-10 bg-slate-600 uppercase drop-shadow">
              <tr className="table-row">
                {statuses.data?.map((status) => {
                  return (
                    <th key={status.id.toString()} className="py-3 px-6">
                      {status.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {statuses.data?.map((status) => {
                  return (
                    <td
                      key={status.id.toString()}
                      id={status.id.toString()}
                      className="align-top"
                    >
                      <Dropzone
                        dragged={currentlyDragged}
                        className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
                      >
                        {tasks.data
                          ?.filter((task) => task.statusId == status.id)
                          .map((task) => {
                            return (
                              <Draggable
                                key={task.id}
                                setDragged={setCurrentlyDragged}
                              >
                                <TaskForm
                                  task={task}
                                  statuses={statuses.data}
                                  onUpdate={handleUpdateTask}
                                />
                              </Draggable>
                            );
                          })}
                        <AddButton
                          disabled={isAddingCell}
                          onClick={async () => handleAddTask(status.id)}
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
    </>
  );
};

export default Home;
