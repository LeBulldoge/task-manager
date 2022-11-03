import { MouseEvent } from "react";

export const AddButton = (props: {
  disabled?: boolean;
  onClick: (e: MouseEvent) => void;
}) => {
  return (
    <input
      type="button"
      value="+"
      disabled={props.disabled}
      onClick={props.onClick}
      className="h-36 w-36 rounded-xl border border-outline text-center font-mono text-7xl text-secondary transition-all ease-linear hover:drop-shadow-lg hover:border-none hover:text-primary-text hover:cursor-pointer hover:bg-primary disabled:animate-pulse"
    />
  );
};
