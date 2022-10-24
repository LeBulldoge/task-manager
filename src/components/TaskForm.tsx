import { trpc } from "@/utils/trpc";
import { Task } from "@prisma/client";
import { ChangeEvent, FormEvent, useState } from "react";

export const TaskForm = (props: {
  task: Task;
  submitHandler?: (task: Task) => void;
}) => {
  const [task, setTask] = useState(props.task);

  const updateTask = trpc.tasks.updateTask.useMutation();

  const handleOnChange = (event: ChangeEvent, changed: "name" | "status") => {
    const element = event.target as HTMLSelectElement | HTMLInputElement;
    const attrs = element.getAttribute("class");
    element.setAttribute("class", "border border-yellow-600 " + attrs);

    task[changed] = element.value;
    setTask(task);
  };

  const handleOnSubmit = (event: FormEvent) => {
    event.preventDefault()

    updateTask.mutateAsync(task)
      .then((newTask) => {
        if (props.submitHandler) props.submitHandler(newTask)
      })
  }

  return (
    <form
      draggable="true"
      className="flex h-36 w-36 flex-col bg-slate-600 p-2 drop-shadow-xl"
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
      <label className="text-xs">
        Title:
        <input
          type="text"
          defaultValue={task.name}
          onChange={(e) => handleOnChange(e, "name")}
          className="mb-2 w-full rounded border-b border-b-slate-500 bg-slate-600 px-2 text-base"
        />
      </label>
      <label className="text-xs">
        Status:
        <select
          defaultValue={task.status}
          onChange={(e) => handleOnChange(e, "status")}
          className="w-full rounded border-b border-b-slate-500 bg-slate-600 px-1 text-base capitalize"
        >
          <option>created</option>
          <option>in-progress</option>
          <option>finished</option>
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
