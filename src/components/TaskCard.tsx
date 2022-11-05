import { TaskForm, TaskFormProps } from "./TaskForm";

export const TaskCard = (props: TaskFormProps) => {
  return (
    <div
      className={`relative flex h-36 w-36 flex-col rounded-xl p-2 ${
        !props.expanded
          ? "transition ease-in-out hover:translate-y-1 hover:scale-110 hover:shadow"
          : ""
      }`}
    >
      <TaskForm {...props} />
    </div>
  );
};
