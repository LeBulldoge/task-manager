import type { NextPage } from "next";
import { useState } from "react";

import Image from "next/future/image";
import Head from "next/head";

import { trpc } from "@/utils/trpc";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskCard } from "@/components/TaskCard";
import { AddButton } from "@/components/AddButton";
import { Dashboard } from "@/components/Dashboard";

const Home: NextPage = () => {
  const [currentlyDragged, setCurrentlyDragged] = useState<HTMLElement | null>(
    null
  );
  const [isAddingCell, setIsAddingCell] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const utils = trpc.useContext();
  const statusQuery = trpc.tasks.getAllStatuses.useQuery({
    includeTasks: true,
  });

  const createTask = trpc.tasks.createTask.useMutation({
    async onSuccess() {
      await utils.tasks.invalidate();
    },
  });

  const updateTask = trpc.tasks.updateTask.useMutation({
    async onSuccess() {
      await utils.tasks.invalidate();
    },
  });

  const handleAddTask = (status: number) => {
    if (isAddingCell) return;

    createTask
      .mutateAsync({ data: { name: "New task", statusId: status } })
      .then(() => {
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

      <main className="flex min-h-screen min-w-full">
        <div>
          <Dashboard />
        </div>
        <table className="mb-auto w-auto table-fixed overflow-x-scroll bg-slate-500 md:w-full">
          <thead className="sticky z-10 top-0 bg-slate-600 uppercase drop-shadow">
            <tr className="h-12">
              {statusQuery.data?.map((status) => {
                return (
                  <th key={status.id.toString()} className="w-1/12 py-3 px-6">
                    {status.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {statusQuery.data?.map((status) => {
                return (
                  <td
                    key={status.id.toString()}
                    id={status.id.toString()}
                    className="border-collapse border-x-2 border-slate-600 align-top"
                  >
                    <Dropzone
                      className="flex flex-wrap items-center justify-center gap-2 px-2 py-4"
                      dragged={currentlyDragged}
                      onDrop={() => {
                        if (!currentlyDragged) return;
                        updateTask.mutate({
                          where: {
                            id: Number.parseInt(currentlyDragged.id),
                          },
                          data: {
                            statusId: status.id,
                          },
                        });
                      }}
                    >
                      {status.tasks.map((task) => {
                        return (
                          <Draggable
                            id={task.id.toString()}
                            key={task.id}
                            disable={isEditing}
                            setDragged={setCurrentlyDragged}
                          >
                            <TaskCard
                              task={task}
                              statuses={statusQuery.data}
                              onEdit={setIsEditing}
                            />
                          </Draggable>
                        );
                      })}
                      <AddButton
                        disabled={isAddingCell}
                        onClick={() => handleAddTask(status.id)}
                      />
                    </Dropzone>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        <a
          href="https://github.com/LeBulldoge/task-manager"
          className="group fixed bottom-0 right-0 flex gap-1 place-self-end pr-3 pb-1 text-xs text-slate-300 hover:underline"
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
