import { trpc } from "@/utils/trpc";
import { Status, Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export const TaskForm = (props: {
  task: Task;
  statuses: Status[];
  onEdit?: (isEditing: boolean) => void;
  setIsShown: (isShown: boolean) => void;
}) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);

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
    const getDefValue = () => {
      switch (event.currentTarget.name) {
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

    const color = "border-orange-200/75";
    if (event.currentTarget.value != getDefValue()) {
      if (!event.target.classList.contains(color)) {
        event.currentTarget.classList.add(color);
      }
    } else {
      event.currentTarget.classList.remove(color);
    }
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

    props.setIsShown(false);
  };

  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    setIsTransitioning(true);
  });

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 bg-transparent p-16 backdrop-blur-0 transition-all duration-200 ease-linear hover:cursor-auto ${
        isTransitioning ? "bg-slate-700/50 backdrop-blur-sm" : "backdrop-blur-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) props.setIsShown(false);
      }}
    >
      <form
        className={`group flex h-full w-full flex-col overflow-scroll rounded-xl bg-slate-600 p-4 shadow-xl transition duration-200 ease-out ${
          isTransitioning ? "scale-100" : "scale-0"
        }`}
        onSubmit={handleOnSubmit}
      >
        <div className="flex flex-wrap justify-between gap-10 ">
          <label className="grow text-xs">
            Title:
            <input
              name="name"
              autoFocus
              type="text"
              defaultValue={props.task.name}
              required={true}
              disabled={isBeingDeleted}
              onChange={handleOnChange}
              onFocus={() => props.onEdit?.(true)}
              onBlur={() => props.onEdit?.(false)}
              className="mb-2 w-full rounded border border-transparent border-b-slate-500 bg-transparent px-2 text-base focus:border-b-slate-400"
            />
          </label>
          <label className="text-xs">
            Created at:
            <p className="mb-2 w-full rounded border border-transparent border-b-slate-500 bg-transparent px-2 text-base">
              {props.task.createdAt.toLocaleString()}
            </p>
          </label>
          <label className="text-xs">
            Updated at:
            <p className="mb-2 w-full rounded border border-transparent border-b-slate-500 bg-transparent px-2 text-base">
              {props.task.updatedAt.toLocaleString()}
            </p>
          </label>
          <input
            type="button"
            disabled={isBeingDeleted}
            onClick={() => {
              props.setIsShown(false);
            }}
            className="h-4 w-4 rounded font-mono text-xs text-rose-300 opacity-0 transition duration-300 ease-linear hover:cursor-pointer group-hover:opacity-100"
            value="x"
          />
        </div>
        <label className="text-xs">
          Status:
          <select
            name="statusId"
            defaultValue={
              props.statuses.find((s) => s.id === props.task.statusId)?.name ??
              0
            }
            disabled={isBeingDeleted}
            onChange={handleOnChange}
            className="w-full rounded border border-transparent border-b-slate-500 bg-transparent px-1 text-base capitalize"
          >
            {props.statuses.map((status) => {
              return <option key={status.id.toString()}>{status.name}</option>;
            })}
          </select>
        </label>
        <label className="my-10 grow text-xs">
          Description:
          <textarea
            name="description"
            defaultValue={props.task.description ?? ""}
            disabled={isBeingDeleted}
            onChange={handleOnChange}
            className="h-full w-full rounded border border-slate-500 bg-transparent px-1 text-base"
          />
        </label>
        <div className="flex w-full justify-between">
          <input
            type="reset"
            value="Reset"
            className="rounded border-slate-400 p-1 text-rose-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
            disabled={isBeingDeleted}
          />
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
        </div>
      </form>
    </div>
  );
};
