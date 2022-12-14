import { trpc } from "@/utils/trpc";
import { Status } from "@prisma/client";
import { ChangeEvent, useRef } from "react";
import { IconType } from "react-icons";
import { MdArrowDropDown, MdArrowDropUp, MdHistory } from "react-icons/md";

export const Dashboard = () => {
  const utils = trpc.useContext();
  const statusQuery = trpc.tasks.getAllStatuses.useQuery();

  let shouldInvalidate = true;
  const invalidateCallback = {
    async onSuccess() {
      if (shouldInvalidate) utils.tasks.invalidate();
    },
  };
  const createStatus = trpc.tasks.createStatus.useMutation(invalidateCallback);
  const updateStatus = trpc.tasks.updateStatus.useMutation(invalidateCallback);
  const deleteStatus = trpc.tasks.deleteStatus.useMutation(invalidateCallback);

  const statusNameValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const element = e.currentTarget;
    if (
      statusQuery.data?.some(
        (s) => s.name == element.value && s.name != element.defaultValue
      )
    ) {
      element.setCustomValidity("Status already exists");
    } else if (e.currentTarget.validity) {
      element.setCustomValidity("");
    }
  };

  const handleSwapOrder = async (
    direction: "up" | "down",
    status: Status
  ) => {
    let value = status.order + (direction === "up" ? -1 : 1);
    const statusToSwap = statusQuery.data?.find((s) => {
      return s != status && s.order === value;
    });
    if (statusToSwap) {
      shouldInvalidate = false;
      value = statusToSwap.order;
    }
    updateStatus
      .mutateAsync({
        where: { id: status.id },
        data: { order: value },
      })
      .then(() => {
        if (statusToSwap) {
          shouldInvalidate = true;
          updateStatus.mutate({
            where: { id: statusToSwap.id },
            data: { order: status.order },
          });
        }
      });
  };

  return (
    <div className="sticky top-0 left-0 bottom-0 z-50 flex min-h-screen basis-10 flex-col items-center gap-2 bg-layer-2 py-3 px-2">
      <DashGroup title="Status List" icon={MdHistory}>
        <ul className="list-inside">
          {statusQuery.data?.map((status) => {
            return (
              <li
                key={status.id.toString()}
                className="group/item mb-4 flex w-full gap-2 rounded-xl border-b border-outline bg-surface-text/5 p-2 transition-all hover:-translate-x-1 hover:border-b-primary"
              >
                <form
                  className="flex w-full gap-2"
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
                  onBlur={(e) => e.currentTarget.reset()}
                >
                  <div className="flex w-0 flex-col text-primary opacity-0 transition-all ease-linear hover:cursor-pointer group-hover/item:w-4 group-hover/item:opacity-100">
                    <div
                      className="transition hover:text-primary-container-text ease-linear hover:scale-150"
                      hidden={status.order === 0}
                      onClick={() => handleSwapOrder("up", status)}
                    >
                      <MdArrowDropUp size={18} />
                    </div>
                    <div
                      className="transition hover:text-primary-container-text ease-linear hover:scale-150"
                      hidden={
                        status.order ===
                        Math.max(...statusQuery.data.map((s) => s.order))
                      }
                      onClick={() => handleSwapOrder("down", status)}
                    >
                      <MdArrowDropDown size={18} />
                    </div>
                  </div>
                  <input
                    name="statusName"
                    type="text"
                    defaultValue={status.name}
                    className="w-full flex-grow rounded border border-transparent bg-inherit transition-colors ease-linear invalid:border-error"
                    onChange={statusNameValidation}
                  />
                  <input
                    type="button"
                    value="x"
                    className="font-mono text-error opacity-0 transition-all ease-linear hover:cursor-pointer group-hover/item:opacity-100"
                    onClick={() => {
                      deleteStatus.mutateAsync({ where: { id: status.id } });
                    }}
                  />
                </form>
              </li>
            );
          })}
          <div className="mb-4 border-b border-outline" />
          <li
            key="NEW"
            className="mb-4 flex rounded-xl border-b border-outline bg-surface-text/5 p-2 hover:border-b-tetriary"
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
                      order: statusQuery.data?.length ?? 0,
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
                  className="rounded border border-transparent bg-inherit transition-colors ease-linear placeholder:text-tetriary invalid:border-error"
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
      className="group/button z-10 flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-center text-primary-text transition-all ease-linear hover:rounded-lg hover:bg-primary-container-text"
      onClick={(e) => {
        props.onClick(e);
        e.currentTarget.classList.toggle("rounded-lg");
      }}
    >
      <div className="fixed w-auto translate-x-20 overflow-clip rounded-xl bg-surface-inverse p-2 text-surface-inverse-text opacity-0 transition group-hover/button:opacity-75 group-hover/button:delay-300">
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
  const classNamesShow = ["translate-x-12"];
  const classNamesHide = ["-translate-x-full", "opacity-0"];

  return (
    <div className="group w-full">
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
          className="transition ease-linear group-hover/button:scale-110"
        />
      </DashButton>
      <div
        ref={drawer}
        hidden={true}
        className="fixed top-0 left-0 bottom-0 right-0 -translate-x-full bg-surface opacity-0 transition-all duration-300 ease-in md:right-auto"
      >
        <div className="flex h-full flex-col bg-layer-2 py-3 px-2 md:w-64">
          <strong className="mb-5 w-full border-b border-outline text-center text-2xl hover:cursor-default">
            {props.title}
          </strong>
          {props.children}
        </div>
      </div>
    </div>
  );
};
