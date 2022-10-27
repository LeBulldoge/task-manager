import { useRef } from "react";

export const Draggable = (props: {
  children?: React.ReactNode;
  setDragged: (element: HTMLElement | null) => void;
  disable: boolean;
}) => {
  return (
    <div
      onDragStart={(e) => {
        if (props.disable) {
          e.preventDefault();
          return;
        }
        props.setDragged(e.currentTarget);
      }}
      onDragEnd={(e) => {
        e.preventDefault();
        props.setDragged(null);
      }}
      draggable={!props.disable}
      className="hover:cursor-move"
    >
      {props.children}
    </div>
  );
};

export const Dropzone = (props: {
  id?: string;
  children?: React.ReactNode;
  dragged: HTMLElement | null;
  className?: string;
}) => {
  const self = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={self}
      id={props.id}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const element = e.currentTarget;
        if (props.dragged && !element.contains(props.dragged)) {
          // TODO: figure out how to communicate with children
          element.prepend(props.dragged);
        }
      }}
      className={`${props.className} transition-all duration-200 ease-out ${
        props.dragged && !self?.current?.contains(props.dragged)
          ? " border-collapse rounded-bl-lg border border-l-4 border-slate-600 bg-slate-400"
          : " border-transparent"
      }`}
    >
      {props.children}
    </div>
  );
};
