import { fuzzySearch } from "@/utils/fuzzy";
import { trpc } from "@/utils/trpc";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { MdEdit } from "react-icons/md";
import { CompletableInput } from "./CompletableInput";
import TabContainer from "./TabContainer";
import { TaskContext } from "./TaskBoard";
import { MessageContext } from "./Toast";

type TaskForm = HTMLFormElement & {
  name: HTMLInputElement;
  statusId: HTMLInputElement;
  description?: HTMLTextAreaElement;
};

export interface TaskFormProps {
  taskId: number;
  expanded: boolean;
  setExpandedTaskId: (id: number | null) => void;
}

export const TaskForm = (props: TaskFormProps) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [openTabIndex, setOpenTabIndex] = useState(0);

  const taskCtx = useContext(TaskContext);
  const task = taskCtx?.tasks.find((t) => t.id === props.taskId);
  if (!task || !taskCtx) {
    return null;
  }
  const messageCtx = useContext(MessageContext);

  const utils = trpc.useContext();
  const updateTask = trpc.tasks.updateTask.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
      messageCtx?.addMessage({
        type: "info",
        title: "Success",
        text: "Task successfully updated!",
      });
    },
  });
  const addLink = trpc.tasks.addLink.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
    },
  });

  const deleteTask = trpc.tasks.deleteTask.useMutation({
    async onSuccess() {
      utils.tasks.invalidate();
      setIsBeingDeleted(false);
      messageCtx?.addMessage({
        type: "info",
        title: "Success",
        text: "Task successfully deleted!",
      });
    },
    async onError(error) {
      console.log(error);
      setIsBeingDeleted(false);
      messageCtx?.addMessage({
        type: "info",
        title: "Error",
        text: "Could not delete task!",
      });
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
            taskCtx?.statuses?.find((s) => s.id === task.statusId)?.name ?? ""
          );
        case "description":
          return task.description ?? "";
        case "name":
          return task.name;
      }
    };

    element.dataset["edited"] = String(element.value !== getDefValue());
  };

  const handleOnSubmit = async (event: FormEvent<TaskForm>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const statusId =
      taskCtx?.statuses?.find((s) => s.name === form.statusId.value)?.id ?? 0;

    updateTask
      .mutateAsync({
        where: { id: task.id },
        data: {
          name: form.name.value,
          statusId: statusId,
          description: form.description?.value,
        },
      })
      .then(() => {
        form.name.dataset["edited"] = "false";
        form.statusId.dataset["edited"] = "false";
        if (form.description) {
          form.description.dataset["edited"] = "false";
        }
      });
  };

  return (
    <div
      className={`top-0 left-0 right-0 bottom-0 transition-colors duration-200 ease-linear ${
        props.expanded
          ? "fixed z-50 bg-surface/50 p-8 backdrop-blur-sm hover:cursor-auto md:p-16"
          : "absolute z-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) props.setExpandedTaskId(null);
      }}
    >
      <div className="h-full w-full rounded-xl bg-surface">
        <TabContainer
          hidden={!props.expanded}
          tabs={[task.name, "Relations"]}
          onTabChange={setOpenTabIndex}
        />

        {(!props.expanded || openTabIndex === 0) && (
          <form
            data-expanded={props.expanded}
            className="group relative flex h-full w-full flex-col rounded-xl bg-layer-2 p-2 data-[expanded=true]:overflow-scroll data-[expanded=true]:rounded-tl-none data-[expanded=true]:p-4"
            onSubmit={handleOnSubmit}
          >
            <div className="grid grid-flow-col grid-cols-6 grid-rows-3 gap-3 overflow-hidden group-data-[expanded=false]:grid-cols-1 group-data-[expanded=false]:grid-rows-2 group-data-[expanded=true]:gap-5 md:grid-cols-5 md:grid-rows-2">
              <label className="col-span-5 text-xs md:col-span-3">
                Title:
                <input
                  name="name"
                  autoFocus
                  type="text"
                  defaultValue={task.name}
                  required={true}
                  disabled={isBeingDeleted}
                  onChange={handleOnChange}
                  className="w-full rounded border border-transparent border-b-outline bg-transparent px-2 text-base focus:border-b-primary data-[edited=true]:border-tetriary"
                />
              </label>
              <label className="col-span-5 text-xs md:col-span-3">
                Status:
                <select
                  name="statusId"
                  defaultValue={
                    taskCtx?.statuses?.find((s) => s.id === task.statusId)
                      ?.name ?? 0
                  }
                  disabled={isBeingDeleted}
                  onChange={handleOnChange}
                  className="w-full rounded border border-transparent border-b-outline bg-transparent px-1 text-base capitalize data-[edited=true]:border-tetriary"
                >
                  {taskCtx?.statuses?.map((status) => {
                    return (
                      <option key={status.id.toString()}>{status.name}</option>
                    );
                  })}
                </select>
              </label>
              {props.expanded && (
                <>
                  <details className="col-span-3 md:col-span-1">
                    <summary className="text-xs leading-6 hover:cursor-pointer">
                      Created at:
                    </summary>
                    <div className="px-2 text-sm">
                      {task.createdAt.toLocaleString()}
                    </div>
                  </details>
                  <details className="col-span-3 md:col-span-1">
                    <summary className="text-xs leading-6 hover:cursor-pointer">
                      Updated at:
                    </summary>
                    <div className="px-2 text-sm">
                      {task.updatedAt.toLocaleString()}
                    </div>
                  </details>
                  <input
                    type="button"
                    disabled={isBeingDeleted}
                    onClick={() => {
                      props.setExpandedTaskId(null);
                    }}
                    className="h-4 w-4 place-self-end self-start rounded font-mono text-xs text-error opacity-0 transition duration-300 ease-linear hover:cursor-pointer group-hover:opacity-100"
                    value="x"
                  />
                </>
              )}
            </div>
            {props.expanded ? (
              <>
                <label className="my-10 grow text-xs">
                  Description:
                  <textarea
                    name="description"
                    defaultValue={task.description ?? ""}
                    disabled={isBeingDeleted}
                    onChange={handleOnChange}
                    className="mt-2 h-full w-full rounded border border-outline bg-transparent p-2 text-base focus:border-primary data-[edited=true]:border-tetriary"
                  />
                </label>
                <div className="flex w-full justify-between">
                  <input
                    type="reset"
                    value="Reset"
                    className="rounded-full border border-outline px-4 text-error-container-text hover:border-transparent enabled:hover:cursor-pointer enabled:hover:bg-error-container disabled:text-secondary"
                    disabled={isBeingDeleted}
                  />
                  <input
                    type="button"
                    value="Delete"
                    className="rounded-full border border-outline px-4 py-2 text-error-container-text hover:border-transparent enabled:hover:cursor-pointer enabled:hover:bg-error-container disabled:text-secondary"
                    disabled={isBeingDeleted}
                    onClick={() => {
                      setIsBeingDeleted(true);
                      deleteTask.mutate({ where: { id: task.id } });
                    }}
                  />
                  <input
                    type="submit"
                    className="rounded-full bg-primary px-4 py-2 text-primary-text focus:border enabled:hover:cursor-pointer enabled:hover:bg-primary-container-text disabled:text-secondary"
                    disabled={isBeingDeleted}
                    value="Submit"
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                className="mt-2 place-self-center self-end rounded-xl bg-primary p-1.5 text-primary-text transition-all ease-linear hover:rounded-lg hover:bg-primary-container-text enabled:hover:cursor-pointer disabled:text-secondary"
                disabled={isBeingDeleted}
                onClick={() => {
                  props.setExpandedTaskId(task.id);
                }}
              >
                <MdEdit />
              </button>
            )}
          </form>
        )}

        {props.expanded && openTabIndex === 1 && (
          <div className="flex h-full w-full justify-evenly gap-2 rounded-xl bg-layer-2 p-4">
            <div className="flex w-full flex-col items-center rounded-xl p-2">
              <div className="flex w-full px-1 text-xl leading-6">
                <strong className="w-full">Parent tasks</strong>
                <strong>{task.childOf.length}</strong>
              </div>
              <div className="mt-2 mb-4 w-full rounded-full border-y border-outline/50" />
              <ul className="w-fit list-inside list-disc marker:text-primary hover:marker:text-primary-container-text">
                {task.childOf.map((link) => {
                  return (
                    <li
                      key={link.parent.id}
                      className="rounded border border-outline p-1 text-sm hover:cursor-pointer hover:border-primary"
                      onClick={() => props.setExpandedTaskId(link.parent.id)}
                    >
                      {link.type} {link.parent.name}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="my-2 rounded-xl border-x border-outline/50" />
            <div className="flex w-full flex-col items-center rounded-xl p-2">
              <div className="flex w-full px-1 text-xl leading-6">
                <strong className="w-full">Child tasks</strong>
                <strong>{task.parentOf.length}</strong>
              </div>
              <div className="mt-2 mb-4 w-full rounded-full border-y border-outline/50" />
              <ul className="w-fit list-outside list-disc marker:text-primary hover:marker:text-primary-container-text">
                {task.parentOf.map((link) => {
                  return (
                    <li
                      key={link.child.id}
                      className="group/item mb-4 flex w-full gap-2 rounded-xl border-b border-outline bg-surface-text/5 p-2 transition-all hover:-translate-x-1 hover:border-b-primary"
                    >
                      <form
                        className="flex w-full gap-2"
                        onBlur={(e) => e.currentTarget.reset()}
                      >
                        <input
                          name="linkTask"
                          type="text"
                          defaultValue={link.child.name}
                          className="w-full flex-grow rounded border border-transparent bg-inherit transition-colors ease-linear invalid:border-error"
                        />
                        <input
                          name="linkType"
                          type="text"
                          defaultValue={link.type}
                          className="w-full flex-grow rounded border border-transparent bg-inherit transition-colors ease-linear invalid:border-error"
                        />
                        <input
                          type="button"
                          value="x"
                          className="font-mono text-error opacity-0 transition-all ease-linear hover:cursor-pointer group-hover/item:opacity-100"
                          onClick={() => {}}
                        />
                      </form>
                    </li>
                  );
                })}
                <li
                  key="NEW"
                  className="mb-4 flex rounded-xl border-b border-outline bg-surface-text/5 hover:border-b-tetriary"
                >
                  <form
                    className="p-2 w-full"
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <CompletableInput
                      className="w-full flex-grow rounded border border-transparent bg-inherit"
                      source={taskCtx.tasks.filter((t) => t.id != task.id)}
                      predicate={(value, input) => {
                        const resId = fuzzySearch(`${value.id}`, input);
                        if (resId > 0.25) {
                          return true;
                        }
                        const res = fuzzySearch(`${value.name}`, input);
                        return res > 0.25;
                      }}
                      sort={(lhs, rhs, input) =>
                        fuzzySearch(`${lhs.id} : ${lhs.name}`, input) -
                        fuzzySearch(`${rhs.id} : ${rhs.name}`, input)
                      }
                      itemToString={(value) => `${value.id} : ${value.name}`}
                      onSubmit={(_, value) => {
                        if (!value) return;
                        addLink.mutate({
                          type: "Depends on",
                          parentId: task.id,
                          childId: value.id,
                        });
                      }}
                    />
                  </form>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
