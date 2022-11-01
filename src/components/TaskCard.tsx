import { Status, Task } from "@prisma/client";
import { useState } from "react";
import { TaskForm } from "./TaskForm";

export const TaskCard = (props: { task: Task; statuses: Status[] }) => {
  const [enableHover, setDisableHover] = useState(true);
  const handleFormExpanded = (isExpanded: boolean) => {
    setDisableHover(!isExpanded);
  };

  return (
    <div
      className={`relative flex h-36 w-36 flex-col rounded-xl p-2 ${
        enableHover
          ? "transition ease-in-out hover:translate-y-1 hover:scale-110 hover:shadow"
          : ""
      }`}
    >
      <TaskForm {...props} onExpanded={handleFormExpanded} />
    </div>
  );
};
