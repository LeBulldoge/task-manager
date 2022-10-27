import { DragEvent } from "react";

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
  return (
    <div
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
          //element.prepend(props.dragged);
        }
      }}
      className={props.className}
    >
      {props.children}
    </div>
  );
};
