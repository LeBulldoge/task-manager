import { trpc } from "@/utils/trpc";
import { Status, Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useState } from "react";

export const TaskForm = (props: {
  task: Task;
  statuses: Status[];
  onUpdate?: (task: Task) => void;
}) => {
  const [name, setName] = useState(props.task.name);
  const [status, setStatus] = useState(props.task.statusId);

  const updateTask = trpc.tasks.updateTask.useMutation();
  const deleteTask = trpc.tasks.deleteTask.useMutation();

  const handleOnChangeStatus = (event: ChangeEvent<HTMLSelectElement>) => {
    const element = event.target;
    setStatus(props.statuses.find((s) => s.name === element.value)?.id ?? 0);
  };

  const handleOnChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    setName(element.value);
  };

  const handleOnSubmit = (event: FormEvent) => {
    event.preventDefault();

    props.task.name = name;
    props.task.statusId = status;

    updateTask.mutateAsync(props.task).then((newTask) => {
      props.onUpdate?.(newTask);
    });
  };

  return (
    <form
      className="flex h-36 w-36 flex-col bg-slate-600 p-2 shadow-black transition ease-in-out hover:translate-y-1 hover:scale-110 hover:drop-shadow-xl"
      onSubmit={handleOnSubmit}
    >
      <input
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteTask.mutateAsync({ where: { id: props.task.id } }).then(() => {
            if (props.onUpdate) props.onUpdate(props.task);
          });
        }}
        className="absolute h-4 w-4 place-self-end rounded font-mono text-xs text-rose-300 hover:cursor-pointer hover:bg-slate-400"
        value="x"
      />

      <label className="text-xs">
        Title:
        <input
          type="text"
          value={name}
          required={true}
          onChange={(e) => handleOnChangeName(e)}
          className={
            "mb-2 w-full rounded border bg-slate-600 px-2 text-base invalid:border invalid:border-rose-300 " +
            (props.task.name !== name
              ? "border-orange-200/75"
              : "border-slate-600 border-b-slate-500")
          }
        />
      </label>
      <label className="text-xs">
        Status:
        <select
          value={props.statuses.find((s) => s.id === status)?.name ?? 0}
          onChange={(e) => handleOnChangeStatus(e)}
          className={
            "w-full rounded border bg-slate-600 px-1 text-base capitalize " +
            (props.task.statusId !== status
              ? "border-orange-200/75"
              : "border-slate-600 border-b-slate-500")
          }
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
          className="disabled:text-slate-300 rounded border-slate-400 p-1 text-rose-200 enabled:hover:cursor-pointer enabled:hover:bg-slate-500 focus:border"
          disabled={props.task.name === name && props.task.statusId === status}
          onClick={() => {
            setName(props.task.name);
            setStatus(props.task.statusId);
          }}
        />
        <input
          type="submit"
          className="disabled:text-slate-300 rounded border-slate-400 p-1 text-green-200 enabled:hover:cursor-pointer enabled:hover:bg-slate-500 focus:border"
          disabled={props.task.name === name && props.task.statusId === status}
          value="Submit"
        />
      </div>
    </form>
  );
};
