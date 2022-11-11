import { useContext, useEffect, useState } from "react";

import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { TaskRouter } from "@/server/trpc/router/tasks";

import { Dropzone, Draggable } from "@/components/Draggable";
import { TaskCard } from "@/components/TaskCard";
import { AddButton } from "@/components/AddButton";
import { MessageContext } from "./Toast";
import { Status } from "@prisma/client";
import React from "react";

type TaskArray = inferRouterOutputs<TaskRouter>["getAllTasks"];

export const TaskContext = React.createContext<{
  statuses: Status[];
  tasks: TaskArray;
} | null>(null);

export const TaskBoard = () => {
  const { data: tasks, isLoading: tasksAreLoading } =
    trpc.tasks.getAllTasks.useQuery();
  const { data: statuses, isLoading: statusesAreLoading } =
    trpc.tasks.getAllStatuses.useQuery();

  const utils = trpc.useContext();
  const createTask = trpc.tasks.createTask.useMutation({
    async onSuccess() {
      await utils.tasks.invalidate();
    },
  });

  const ctx = useContext(MessageContext);
  const updateTask = trpc.tasks.updateTask.useMutation({
    async onSuccess() {
      await utils.tasks.invalidate();
    },
  });

  const [isAddingCell, setIsAddingCell] = useState(false);
  const handleAddTask = (status: number) => {
    if (isAddingCell) return;

    createTask
      .mutateAsync({ data: { name: "New task", statusId: status } })
      .then(() => {
        setIsAddingCell(false);
        ctx?.addMessage({
          type: "info",
          title: "Success",
          text: "Task added!",
        });
      });

    setIsAddingCell(true);
  };

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const [currentlyDragged, setCurrentlyDragged] = useState<HTMLElement | null>(
    null
  );

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

  if (tasksAreLoading || statusesAreLoading) return <div className="w-full h-full text-center justify-center items-center">Loading...</div>;
  if (!tasks || !statuses) return <div>Loading...</div>;

  return (
    <TaskContext.Provider value={{ tasks, statuses }}>
      <table className="mb-auto w-auto table-fixed overflow-hidden bg-surface md:w-full">
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
            {statuses.map((status) => {
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
            {statuses.map((status) => {
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
                      currentlyDragged.classList.add("animate-pulse");
                      updateTask
                        .mutateAsync({
                          where: {
                            id: Number.parseInt(currentlyDragged.id),
                          },
                          data: {
                            statusId: status.id,
                          },
                        })
                        .finally(() => {
                          currentlyDragged.classList.remove("animate-pulse");
                        });
                    }}
                  >
                    {tasks
                      .filter((task) => task.statusId === status.id)
                      .map((task) => {
                        return (
                          <Draggable
                            id={task.id.toString()}
                            key={task.id}
                            setDraggedElement={setCurrentlyDragged}
                          >
                            <TaskCard
                              expanded={expandedTaskId === task.id}
                              setExpandedTaskId={setExpandedTaskId}
                              taskId={task.id}
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
    </TaskContext.Provider>
  );
};
