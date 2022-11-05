import { TaskRouter } from "@/server/trpc/router/tasks";
import { trpc } from "@/utils/trpc";
import { Status } from "@prisma/client";
import { inferRouterOutputs } from "@trpc/server";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { MdEdit } from "react-icons/md";
import TabContainer, { Tab } from "./TabContainer";
import { MessageContext } from "./Toast";

type TaskForm = HTMLFormElement & {
  name: HTMLInputElement;
  statusId: HTMLInputElement;
  description?: HTMLTextAreaElement;
};
type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type QueryResult = inferRouterOutputs<TaskRouter>["getAllStatuses"];
type Task = ArrElement<ArrElement<QueryResult>["tasks"]>;
export interface TaskFormProps {
  task: Task;
  statusArray: Status[];
  expanded: boolean;
  setExpandedTaskId: (id: number | null) => void;
}

export const TaskForm = (props: TaskFormProps) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [openTabIndex, setOpenTabIndex] = useState(0);

  const utils = trpc.useContext();
  const messageCtx = useContext(MessageContext);
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
            props.statusArray.find((s) => s.id === props.task.statusId)?.name ??
            ""
          );
        case "description":
          return props.task.description ?? "";
        case "name":
          return props.task.name;
      }
    };

    element.dataset["edited"] = String(element.value !== getDefValue());
  };

  const handleOnSubmit = async (event: FormEvent<TaskForm>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const statusId =
      props.statusArray.find((s) => s.name === form.statusId.value)?.id ?? 0;

    updateTask
      .mutateAsync({
        where: { id: props.task.id },
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
            tabs={[props.task.name, "Relations"]}
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
                  defaultValue={props.task.name}
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
                    props.statusArray.find((s) => s.id === props.task.statusId)
                      ?.name ?? 0
                  }
                  disabled={isBeingDeleted}
                  onChange={handleOnChange}
                  className="w-full rounded border border-transparent border-b-outline bg-transparent px-1 text-base capitalize data-[edited=true]:border-tetriary"
                >
                  {props.statusArray.map((status) => {
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
                      {props.task.createdAt.toLocaleString()}
                    </div>
                  </details>
                  <details className="col-span-3 md:col-span-1">
                    <summary className="text-xs leading-6 hover:cursor-pointer">
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
                      props.setExpandedTaskId(null);
                    }}
                    className="h-4 w-4 place-self-end self-start rounded font-mono text-xs text-error opacity-0 transition duration-300 ease-linear hover:cursor-pointer group-hover:opacity-100"
                    value="x"
                  />
                </>
              )}
            </div>

            {props.expanded && (
              <label className="my-10 grow text-xs">
                Description:
                <textarea
                  name="description"
                  defaultValue={props.task.description ?? ""}
                  disabled={isBeingDeleted}
                  onChange={handleOnChange}
                  className="mt-2 h-full w-full rounded border border-outline bg-transparent p-2 text-base focus:border-primary data-[edited=true]:border-tetriary"
                />
              </label>
            )}
            {props.expanded ? (
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
                    deleteTask.mutate({ where: { id: props.task.id } });
                  }}
                />
                <input
                  type="submit"
                  className="rounded-full bg-primary px-4 py-2 text-primary-text focus:border enabled:hover:cursor-pointer enabled:hover:bg-primary-container-text disabled:text-secondary"
                  disabled={isBeingDeleted}
                  value="Submit"
                />
              </div>
            ) : (
              <button
                type="button"
                className="mt-2 place-self-center self-end rounded-xl bg-primary p-1.5 text-primary-text transition-all ease-linear hover:rounded-lg hover:bg-primary-container-text enabled:hover:cursor-pointer disabled:text-secondary"
                disabled={isBeingDeleted}
                onClick={() => {
                  props.setExpandedTaskId(props.task.id);
                }}
              >
                <MdEdit />
              </button>
            )}
          </form>
        )}
        {props.expanded && openTabIndex === 1 && (
          <div className="flex h-full w-full justify-evenly gap-2 bg-layer-2 p-4">
            <div className="flex w-full flex-col items-center rounded-xl p-2">
              <strong className="text-xl leading-6">
                Parent tasks: {props.task.childOf.length}
              </strong>
              <div className="mt-2 mb-4 w-full rounded-full border-y border-outline/50" />
              <ul className="w-fit list-inside list-disc marker:text-primary hover:marker:text-primary-container-text">
                {props.task.childOf.map((link) => {
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
            <div className="rounded-xl border-x my-2 border-outline/50" />
            <div className="flex w-full flex-col items-center rounded-xl p-2">
              <strong className="w-full text-xl leading-6">
                Child tasks: <span className="text-right">{props.task.parentOf.length}</span>
              </strong>
              <div className="mt-2 mb-4 w-full rounded-full border-y border-outline/50" />
              <ul className="w-fit list-outside list-disc marker:text-primary hover:marker:text-primary-container-text">
                {props.task.parentOf.map((link) => {
                  return (
                    <li
                      key={link.child.id}
                      className="rounded border border-outline p-1 text-sm hover:cursor-pointer hover:border-primary"
                      onClick={() => props.setExpandedTaskId(link.child.id)}
                    >
                      {link.child.name}{" "}
                      <span className="lowercase">{link.type}</span> this
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
