import type { NextPage } from "next";
import { useEffect, useState } from "react";

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

  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const res = entries.some(
          (e) => !e.isIntersecting && e.boundingClientRect.y < 0
        );
        if (res != isIntersecting) setIsIntersecting(res);
      },
      { threshold: 1 }
    );

    const targets = document.querySelectorAll(".scroll-intersect");
    targets.forEach((target) => {
      observer.observe(target);
    });

    () =>
      targets.forEach((target) => {
        observer.unobserve(target);
      });
  });

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
        <table className="mb-auto w-auto table-fixed overflow-x-scroll bg-surface md:w-full">
          <thead
            className={`sticky top-0 z-10 bg-surface uppercase transition-all ease-linear ${
              isIntersecting ? "shadow" : ""
            }`}
          >
            <tr
              className={`h-12 transition-all ease-linear ${
                isIntersecting ? "bg-layer-2" : ""
              }`}
            >
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
                    className="align-top"
                  >
                    <Dropzone
                      className="scroll-intersect flex flex-wrap items-center justify-center gap-2 px-2 py-4"
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
                            setDragged={setCurrentlyDragged}
                          >
                            <TaskCard task={task} statuses={statusQuery.data} />
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
          className="group fixed bottom-0 right-0 flex gap-1 place-self-end pr-3 pb-1 text-xs hover:underline"
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
