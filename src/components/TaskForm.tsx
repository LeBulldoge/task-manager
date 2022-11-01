import { trpc } from "@/utils/trpc";
import { Status, Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export const TaskForm = (props: { task: Task; statuses: Status[] }) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const utils = trpc.useContext();
  const updateTask = trpc.tasks.updateTask.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
    },
  });

  const deleteTask = trpc.tasks.deleteTask.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
      setIsBeingDeleted(false);
    },
    async onError(error) {
      console.log(error);
      setIsBeingDeleted(false);
    },
  });

  const handleOnChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const element = event.currentTarget;
    const getDefValue = () => {
      switch (element.name) {
        case "statusId":
          return (
            props.statuses.find((s) => s.id === props.task.statusId)?.name ?? ""
          );
        case "description":
          return props.task.description;
        case "name":
          return props.task.name;
      }
    };

    const result = element.value != getDefValue();
    element.dataset["edited"] = String(result);
  };

  const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget as HTMLFormElement & {
      name: HTMLInputElement;
      statusId: HTMLInputElement;
      description: HTMLTextAreaElement;
    };

    const statusId =
      props.statuses.find((s) => s.name === element.statusId.value)?.id ?? 0;

    updateTask.mutate({
      where: { id: props.task.id },
      data: {
        name: element.name.value,
        statusId: statusId,
        description: element.description.value,
      },
    });

    setIsExpanded(false);
  };

  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    setIsTransitioning(true);
  });

  return (
    <div
      className={`top-0 left-0 right-0 bottom-0 ${
        isExpanded
          ? `fixed z-50 bg-transparent p-8 backdrop-blur-0 transition-colors duration-200 ease-linear hover:cursor-auto md:p-16 ${
              isTransitioning
                ? "bg-slate-700/50 backdrop-blur-sm"
                : "backdrop-blur-0"
            }`
          : "absolute z-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsExpanded(false);
      }}
    >
      <form
        className="group flex h-full w-full flex-col overflow-scroll rounded-xl bg-slate-600 p-4 shadow-xl transition duration-200 ease-out"
        onSubmit={handleOnSubmit}
      >
        <div
          data-expanded={isExpanded}
          className="grid grid-flow-col grid-cols-6 grid-rows-3 overflow-hidden data-[expanded=false]:grid-cols-1 data-[expanded=false]:grid-rows-2 data-[expanded=true]:gap-5 md:grid-cols-5 md:grid-rows-2"
        >
          <label className="col-span-4 text-xs md:col-span-3">
            Title:
            <input
              name="name"
              autoFocus
              type="text"
              defaultValue={props.task.name}
              required={true}
              disabled={isBeingDeleted}
              onChange={handleOnChange}
              className="w-full rounded border border-transparent border-b-slate-500 data-[edited=true]:border-orange-300/50 bg-transparent px-2 text-base focus:border-b-slate-400"
            />
          </label>
          <label className="col-span-4 text-xs md:col-span-3">
            Status:
            <select
              name="statusId"
              defaultValue={
                props.statuses.find((s) => s.id === props.task.statusId)
                  ?.name ?? 0
              }
              disabled={isBeingDeleted}
              onChange={handleOnChange}
              className="w-full rounded border border-transparent data-[edited=true]:border-orange-300/50 border-b-slate-500 bg-transparent px-1 text-base capitalize"
            >
              {props.statuses.map((status) => {
                return (
                  <option key={status.id.toString()}>{status.name}</option>
                );
              })}
            </select>
          </label>
          {isExpanded && (
            <>
              <details
                className="col-span-3 md:col-span-1"
                open={isDateOpen === 0}
              >
                <summary
                  className="text-xs leading-6 hover:cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDateOpen(0);
                  }}
                >
                  Created at:
                </summary>
                <div className="px-2 text-sm">
                  {props.task.createdAt.toLocaleString()}
                </div>
              </details>
              <details
                className="col-span-3 md:col-span-1"
                open={isDateOpen === 1}
              >
                <summary
                  className="text-xs leading-6 hover:cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDateOpen(1);
                  }}
                >
                  Updated at:
                </summary>
                <div className="px-2 text-sm">
                  {props.task.updatedAt.toLocaleString()}
                </div>
              </details>
              <input
                type="button"
                disabled={isBeingDeleted}
                onClick={() => {
                  setIsExpanded(false);
                }}
                className="h-4 w-4 place-self-end self-start rounded font-mono text-xs text-rose-300 opacity-0 transition duration-300 ease-linear hover:cursor-pointer group-hover:opacity-100"
                value="x"
              />
            </>
          )}
        </div>

        {isExpanded && (
          <label className="my-10 grow text-xs">
            Description:
            <textarea
              name="description"
              defaultValue={props.task.description ?? ""}
              disabled={isBeingDeleted}
              onChange={handleOnChange}
              className="h-full m-2 w-full rounded border data-[edited=true]:border-orange-300/50  border-slate-500 bg-transparent px-1 text-base"
            />
          </label>
        )}
        <div className="flex w-full justify-between">
          <input
            type="reset"
            value="Reset"
            className="rounded border-slate-400 p-1 text-rose-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
            disabled={isBeingDeleted}
          />
          {isExpanded ? (
            <>
              <input
                type="button"
                value="Delete"
                className="rounded border-slate-400 p-1 text-rose-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
                disabled={isBeingDeleted}
                onClick={() => {
                  setIsBeingDeleted(true);
                  deleteTask.mutate({ where: { id: props.task.id } });
                }}
              />
              <input
                type="submit"
                className="rounded border-slate-400 p-1 text-blue-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
                disabled={isBeingDeleted}
                value="Submit"
              />
            </>
          ) : (
            <input
              type="button"
              className="rounded border-slate-400 p-1 text-blue-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
              disabled={isBeingDeleted}
              onClick={(e) => {
                console.log(e);
                setIsExpanded(true);
              }}
              value="Edit"
            />
          )}
        </div>
      </form>
    </div>
  );
};
