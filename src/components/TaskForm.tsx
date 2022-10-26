import { trpc } from "@/utils/trpc";
import { Status, Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useState } from "react";

export const TaskForm = (props: {
  task: Task;
  statuses: Status[];
  updateHandler?: (task: Task) => void;
}) => {
  const [task, setTask] = useState(props.task);

  const updateTask = trpc.tasks.updateTask.useMutation();
  const deleteTask = trpc.tasks.deleteTask.useMutation();

  const handleOnChangeStatus = (event: ChangeEvent<HTMLSelectElement>) => {
    const element = event.target;
    const attrs = element.getAttribute("class");
    element.setAttribute("class", "border border-yellow-600 " + attrs);

    task.statusId =
      props.statuses.find((s) => s.name === element.value)?.id ?? 0;
    setTask(task);
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    const attrs = element.getAttribute("class");
    element.setAttribute("class", "border border-yellow-600 " + attrs);

    task.name = element.value;
    setTask(task);
  };

  const handleOnSubmit = (event: FormEvent) => {
    event.preventDefault();

    updateTask.mutateAsync(task).then((newTask) => {
      if (props.updateHandler) props.updateHandler(newTask);
    });
  };

  return (
    <form
      draggable="true"
      className="flex h-36 w-36 flex-col bg-slate-600 p-2 shadow-black transition ease-in-out hover:translate-y-1 hover:scale-110 hover:drop-shadow-xl"
      onDragEnd={(e) => {
        const element = e.target as HTMLElement;
        if (element.parentElement?.parentElement?.id) {
          const select = element.getElementsByTagName("select").item(0);
          if (select) {
            select.value = element.parentElement?.parentElement?.id;
          }
        }
      }}
      onSubmit={handleOnSubmit}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteTask.mutateAsync({ where: { id: task.id } }).then(() => {
            if (props.updateHandler) props.updateHandler(task);
          });
        }}
        className="absolute h-4 w-4 place-self-end rounded font-mono text-xs text-rose-300 hover:cursor-pointer hover:bg-slate-400"
      >
        x
      </button>

      <label className="text-xs">
        Title:
        <input
          type="text"
          defaultValue={task.name}
          required={true}
          onChange={(e) => handleOnChange(e)}
          className="mb-2 w-full rounded border-b border-b-slate-500 bg-slate-600 px-2 text-base invalid:border invalid:border-rose-300"
        />
      </label>
      <label className="text-xs">
        Status:
        <select
          defaultValue={
            props.statuses.find((s) => s.id === task.statusId)?.name ?? 0
          }
          onChange={(e) => handleOnChangeStatus(e)}
          className="w-full rounded border-b border-b-slate-500 bg-slate-600 px-1 text-base capitalize"
        >
          {props.statuses.map((status) => {
            return <option key={status.id.toString()}>{status.name}</option>;
          })}
        </select>
      </label>
      <div className="grow" />
      <input
        className="place-self-end rounded border-slate-400 p-1 hover:cursor-pointer hover:bg-slate-500 focus:border"
        type="submit"
        value="Submit"
      />
    </form>
  );
};
