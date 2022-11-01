import { Status, Task } from "@prisma/client";
import { TaskForm } from "./TaskForm";

export const TaskCard = (props: {
  task: Task;
  statuses: Status[];
}) => {
  return (
    <div className="relative">
      <div className="group relative flex h-36 w-36 flex-col bg-transparent rounded-xl p-2 transition ease-in-out hover:translate-y-1 hover:scale-110 hover:shadow" />
      <TaskForm {...props} />
    </div>
  );
};
