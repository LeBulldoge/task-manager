import { MouseEventHandler, useState } from "react";

const TabContainer = ({
  onTabChange,
  tabs,
  hidden,
}: {
  onTabChange: (index: number) => void;
  tabs: string[];
  hidden: boolean;
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div
      className={`absolute flex w-fit -translate-y-full gap-2 ${
        hidden ? "hidden" : ""
      }`}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={index}
          active={activeTabIndex === index}
          onClick={() => {
            setActiveTabIndex(index);
            onTabChange(index);
          }}
        >
          {tab}
        </Tab>
      ))}
    </div>
  );
};

export default TabContainer;

export const Tab = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: MouseEventHandler;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-fit rounded-xl rounded-b-none px-2 py-1 transition-all ease-linear hover:cursor-pointer ${
        active ? "bg-layer-2" : "bg-primary/[.02]"
      }`}
    >
      {children}
    </div>
  );
};
