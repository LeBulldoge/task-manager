import { trpc } from "@/utils/trpc";
import { useRef, useState } from "react";

export const Dashboard = () => {
  const utils = trpc.useContext();
  const statuses = trpc.tasks.getAllStatuses.useQuery();

  return (
    <div className="sticky top-0 left-0 z-50 flex h-screen basis-10 flex-col items-center gap-2 bg-slate-600 py-3 px-2 shadow">
      <DashGroup icon="S" title="Status List">
        <ul className="list-inside list-disc">
          {statuses.data?.map((status) => {
            return (
              <li
                key={status.id.toString()}
                className="mb-4 rounded border border-slate-500 border-l-blue-300 p-2 text-blue-300"
              >
                <input
                  type="text"
                  defaultValue={status.name}
                  className="bg-inherit text-white"
                />
              </li>
            );
          })}
        </ul>
      </DashGroup>
    </div>
  );
};

export const DashButton = (props: {
  text: string;
  onClick: React.MouseEventHandler;
}) => {
  return (
    <button
      className="z-10 h-8 w-8 overflow-clip rounded-2xl border border-slate-500 bg-blue-400 px-2 text-center transition-all ease-linear group-hover:rounded-lg group-hover:bg-blue-300"
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};

export const DashGroup = (props: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => {
  const drawer = useRef<HTMLDivElement>(null);
  const classNames = ["translate-x-12", "px-2", "opacity-100"];

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
        text={props.icon}
        onClick={() => {
          if (!drawer.current) return;
          const element = drawer.current;
          element.toggleAttribute("hidden");
          element.offsetHeight; // hack to trigger reflow
          classNames.forEach((name) => {
            if (!element.hidden) {
              element.classList.add(name);
            } else {
              element.classList.remove(name);
            }
          });
        }}
      />
      <div
        ref={drawer}
        hidden={true}
        className="fixed top-0 left-0 bottom-0 flex -translate-x-full flex-col border-x border-slate-500 bg-slate-600 py-3 opacity-0 shadow transition-all duration-300 ease-in"
      >
        <strong className="mb-5 w-full border-b border-slate-400 text-center text-2xl hover:cursor-default">
          {props.title}
        </strong>
        {props.children}
      </div>
    </div>
  );
};
