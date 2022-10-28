import type { NextPage } from "next";
import { useState } from "react";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskForm } from "@/components/TaskForm";
import { trpc } from "@/utils/trpc";
import Image from "next/future/image";
import { AddButton } from "@/components/AddButton";
import Head from "next/head";
import { Dashboard } from "@/components/Dashboard";

const Home: NextPage = () => {
  const [currentlyDragged, setCurrentlyDragged] = useState<HTMLElement | null>(
    null
  );
  const [isAddingCell, setIsAddingCell] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const utils = trpc.useContext();
  const tasks = trpc.tasks.getAllTasks.useQuery();
  const statuses = trpc.tasks.getAllStatuses.useQuery();

  const createTask = trpc.tasks.createTask.useMutation({
    async onSuccess() {
      await utils.tasks.invalidate();
    }
  });

  const handleAddTask = (status: number) => {
    if (isAddingCell) return;

    createTask.mutateAsync({ data: { name: "New task", statusId: status } }).then(() => {
      setIsAddingCell(false);
    });

    setIsAddingCell(true);
  };

  return (
    <>
      <Head>
        <title>Task Manager</title>
        <meta name="description" content="WIP task manager web application" />
      </Head>

      <main className="container flex min-h-screen min-w-full flex-col items-center">
        <div className="flex">
          <Dashboard />
          <table className="mb-auto w-full table-fixed overflow-y-auto bg-slate-500">
            <thead className="sticky top-0 bg-slate-600 uppercase drop-shadow">
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
                                disable={isEditing}
                                setDragged={setCurrentlyDragged}
                              >
                                <TaskForm
                                  task={task}
                                  statuses={statuses.data}
                                  onEdit={setIsEditing}
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
