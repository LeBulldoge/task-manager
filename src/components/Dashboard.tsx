import { trpc } from "@/utils/trpc";
import { ChangeEvent, useRef, useState } from "react";
import { IconType } from "react-icons";
import { MdHistory } from "react-icons/md";

export const Dashboard = () => {
  const utils = trpc.useContext();
  const statuses = trpc.tasks.getAllStatuses.useQuery();

  const invalidate = {
    async onSuccess() {
      utils.tasks.invalidate();
    },
  };
  const createStatus = trpc.tasks.createStatus.useMutation(invalidate);
  const updateStatus = trpc.tasks.updateStatus.useMutation(invalidate);
  const deleteStatus = trpc.tasks.deleteStatus.useMutation(invalidate);

  const statusNameValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const element = e.currentTarget;
    if (
      statuses.data?.some(
        (s) => s.name == element.value && s.name != element.defaultValue
      )
    ) {
      element.setCustomValidity("Status already exists");
    } else if (e.currentTarget.validity) {
      element.setCustomValidity("");
    }
  };

  return (
    <div className="sticky top-0 left-0 bottom-0 z-50 flex min-h-screen basis-10 flex-col items-center gap-2 bg-slate-600 py-3 px-2 shadow">
      <DashGroup title="Status List" icon={MdHistory}>
        <ul className="list-inside list-disc">
          {statuses.data?.map((status) => {
            return (
              <li
                key={status.id.toString()}
                className="group/item mb-4 flex gap-2 rounded border border-slate-500 border-l-blue-300 p-2 text-blue-300 transition-all hover:-translate-x-1 hover:border-l-blue-200"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const element =
                      e.currentTarget as typeof e.currentTarget & {
                        statusName: HTMLInputElement;
                      };
                    updateStatus.mutateAsync({
                      where: { id: status.id },
                      data: { name: element.statusName.value },
                    });
                  }}
                  onBlur={(e) => {
                    const element =
                      e.currentTarget as typeof e.currentTarget & {
                        statusName: HTMLInputElement;
                      };
                    element.statusName.value = element.statusName.defaultValue;
                  }}
                >
                  <input
                    name="statusName"
                    type="text"
                    defaultValue={status.name}
                    className="bg-inherit text-white transition-colors ease-linear invalid:rounded invalid:border invalid:border-rose-400"
                    onChange={statusNameValidation}
                  />
                  <input
                    type="button"
                    value="x"
                    className="font-mono text-rose-200 opacity-0 transition-all ease-linear hover:cursor-pointer group-hover/item:opacity-100"
                    onClick={() => {
                      deleteStatus.mutateAsync({ where: { id: status.id } });
                    }}
                  />
                </form>
              </li>
            );
          })}
          <div className="mb-4 border-b border-slate-500" />
          <li
            key="NEW"
            className="mb-4 flex rounded border border-slate-500 border-l-blue-300 p-2 text-blue-300"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const element = e.currentTarget as typeof e.currentTarget & {
                  statusName: HTMLInputElement;
                };
                createStatus
                  .mutateAsync({
                    data: {
                      name: element.statusName.value,
                      order: statuses.data?.length ?? 0,
                    },
                  })
                  .then(() => (element.statusName.value = ""));
              }}
            >
              <label>
                <input
                  name="statusName"
                  type="text"
                  placeholder="Add a new status..."
                  className="bg-inherit text-white transition-colors ease-linear invalid:rounded invalid:border invalid:border-rose-400"
                  onChange={statusNameValidation}
                />
              </label>
            </form>
          </li>
        </ul>
      </DashGroup>
    </div>
  );
};

export const DashButton = (props: {
  tooltip: string;
  children: React.ReactNode;
  onClick: React.MouseEventHandler;
}) => {
  return (
    <button
      className="group/button z-10 flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-500 bg-blue-400 text-center transition-all ease-linear group-hover:rounded-lg group-hover:bg-blue-300"
      onClick={props.onClick}
    >
      <div className="fixed w-auto translate-x-20 overflow-clip rounded border border-slate-500 bg-slate-700 p-1 opacity-0 transition group-hover/button:opacity-75 group-hover/button:delay-300">
        {props.tooltip}
      </div>
      {props.children}
    </button>
  );
};

export const DashGroup = (props: {
  icon: IconType;
  title: string;
  children: React.ReactNode;
}) => {
  const drawer = useRef<HTMLDivElement>(null);
  const classNamesShow = ["translate-x-12", "px-2"];
  const classNamesHide = ["-translate-x-full", "opacity-0"];

  const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout>();

  return (
    <div
      className="group w-full"
      onMouseEnter={() => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          setTimeoutHandle(undefined);
        }
      }}
      onMouseLeave={(e) => {
        if (!drawer.current?.hidden && !timeoutHandle) {
          const button = e.currentTarget.firstElementChild as HTMLButtonElement;
          setTimeoutHandle(
            setTimeout(() => {
              button.click();
            }, 300)
          );
        }
      }}
    >
      <DashButton
        tooltip={props.title}
        onClick={() => {
          if (!drawer.current) return;
          const element = drawer.current;
          element.toggleAttribute("hidden");
          element.offsetHeight; // hack to trigger reflow
          if (!element.hidden) {
            classNamesHide.forEach((name) => element.classList.remove(name));
            classNamesShow.forEach((name) => element.classList.add(name));
          } else {
            classNamesShow.forEach((name) => element.classList.remove(name));
            classNamesHide.forEach((name) => element.classList.add(name));
          }
        }}
      >
        <props.icon
          size={24}
          className="text-blue-100 transition ease-linear group-hover/button:scale-110"
        />
      </DashButton>
      <div
        ref={drawer}
        hidden={true}
        className="fixed top-0 left-0 bottom-0 right-12 flex -translate-x-full flex-col border-x border-slate-500 bg-slate-600 py-3 opacity-0 shadow transition-all duration-300 ease-in md:right-auto"
      >
        <strong className="mb-5 w-full border-b border-slate-400 text-center text-2xl hover:cursor-default">
          {props.title}
        </strong>
        {props.children}
      </div>
    </div>
  );
};
