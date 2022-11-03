import { DragEvent, MouseEvent, useRef, useState } from "react";
import type { DragEventHandler } from "react";

export const Draggable = (props: {
  id: string;
  children?: React.ReactNode;
  setDragged: (element: HTMLElement | null) => void;
}) => {
  const [disabled, setDisabled] = useState(false);

  const ignoredNodes = ["input", "select", "textarea"];
  const handleDisableDrag = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const result = ignoredNodes.includes(target.nodeName.toLowerCase());
    if (disabled != result) {
      setDisabled(result);
    }
  };

  return (
    <div
      id={props.id}
      onClick={handleDisableDrag}
      onMouseDown={handleDisableDrag}
      onDragStart={(e: DragEvent<HTMLElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        props.setDragged(e.currentTarget);
      }}
      onDragEnd={(e) => {
        e.preventDefault();
        props.setDragged(null);
      }}
      draggable={!disabled}
      className="hover:cursor-move"
    >
      {props.children}
    </div>
  );
};

export const Dropzone = (props: {
  id?: string;
  children?: React.ReactNode;
  className?: string;
  dragged: HTMLElement | null;
  onDrop?: DragEventHandler;
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
          props.onDrop?.(e);
        }
      }}
      className={`${props.className} rounded-lg transition-all m-2 duration-200 ease-linear ${
        props.dragged && !self?.current?.contains(props.dragged)
          ? "shadow-lg bg-layer-1"
          : ""
      }`}
    >
      {props.children}
    </div>
  );
};
