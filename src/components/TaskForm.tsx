import { trpc } from "@/utils/trpc";
import { Status, Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useState } from "react";

export const TaskForm = (props: {
  task: Task;
  statuses: Status[];
  onEdit?: (isEditing: boolean) => void;
}) => {
  const [name, setName] = useState(props.task.name);
  const [statusId, setStatusId] = useState(props.task.statusId);
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);

  const utils = trpc.useContext();
  const updateTask = trpc.tasks.updateTask.useMutation({
    async onSuccess(task) {
      utils.tasks.invalidate();
    },
  });

  const deleteTask = trpc.tasks.deleteTask.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
    },
    async onError(error) {
      console.log(error);
      setIsBeingDeleted(false);
    },
  });

  const handleOnChangeStatus = async (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const element = event.target;
    setStatusId(props.statuses.find((s) => s.name === element.value)?.id ?? 0);
  };

  const handleOnChangeName = async (event: ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    setName(element.value);
  };

  const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateTask.mutateAsync({
      where: { id: props.task.id },
      data: { name: name, statusId: statusId },
    });
  };

  return (
    <form
      className={`group flex h-36 w-36 flex-col bg-slate-600 p-2 transition ease-in-out hover:translate-y-1 hover:scale-110 hover:shadow ${
        !isBeingDeleted || "animate-pulse"
      }`}
      onSubmit={handleOnSubmit}
    >
      <label className="flex flex-wrap justify-between text-xs">
        Title:
        <input
          type="button"
          disabled={isBeingDeleted}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            setIsBeingDeleted(true);

            deleteTask.mutateAsync({ where: { id: props.task.id } });
          }}
          className="h-4 w-4 rounded font-mono text-xs text-rose-300 opacity-0 transition ease-linear hover:cursor-pointer group-hover:opacity-100"
          value="x"
        />
        <input
          type="text"
          value={name}
          required={true}
          disabled={isBeingDeleted}
          onChange={(e) => handleOnChangeName(e)}
          onFocus={() => props.onEdit?.(true)}
          onBlur={() => props.onEdit?.(false)}
          className={`mb-2 w-full rounded border-b ${
            props.task.name !== name
              ? "border-b-orange-200/75"
              : "border-b-slate-500 focus:border-b-slate-400"
          } bg-transparent px-2 text-base invalid:border invalid:border-rose-300`}
        />
      </label>
      <label className="text-xs">
        Status:
        <select
          value={props.statuses.find((s) => s.id === statusId)?.name ?? 0}
          disabled={isBeingDeleted}
          onChange={(e) => handleOnChangeStatus(e)}
          className={`w-full rounded border-b ${
            props.task.statusId !== statusId
              ? "border-orange-200/75"
              : "border-slate-600 border-b-slate-500"
          } bg-transparent px-1 text-base capitalize`}
        >
          {props.statuses.map((status) => {
            return <option key={status.id.toString()}>{status.name}</option>;
          })}
        </select>
      </label>
      <div className="grow" />
      <div className="flex w-full justify-between">
        <input
          type="button"
          value="Reset"
          className="rounded border-slate-400 p-1 text-rose-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
          disabled={
            (props.task.name === name && props.task.statusId === statusId) ||
            isBeingDeleted
          }
          onClick={() => {
            setName(props.task.name);
            setStatusId(props.task.statusId);
          }}
        />
        <input
          type="submit"
          className="rounded border-slate-400 p-1 text-blue-200 focus:border enabled:hover:cursor-pointer enabled:hover:bg-slate-500 disabled:text-slate-300"
          disabled={
            (props.task.name === name && props.task.statusId === statusId) ||
            isBeingDeleted
          }
          value="Submit"
        />
      </div>
    </form>
  );
};
