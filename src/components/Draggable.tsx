import { DragEvent, UIEvent, useRef, useState } from "react";
import type { DragEventHandler, Touch } from "react";

export const Draggable = (props: {
  id: string;
  children?: React.ReactNode;
  setDraggedElement: (element: HTMLElement | null) => void;
}) => {
  const [dropTarget, setDropTarget] = useState<Element>();
  const [startTouch, setStartTouch] = useState<Touch>();
  const [disabled, setDisabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const ignoredNodes = ["input", "select", "textarea"];
  const handleDisableDrag = (e: UIEvent) => {
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
      onTouchStart={(e) => {
        handleDisableDrag(e);
        if (!disabled) {
          setStartTouch(e.touches.item(0));
        }
      }}
      onTouchMove={(e) => {
        if (!startTouch) return;
        const touch = e.touches.item(0);

        if (!isDragging) {
          const distance =
            Math.pow(touch.pageX - startTouch.pageX, 2) +
            Math.pow(touch.pageY - startTouch.pageY, 2);
          if (Math.sqrt(distance) < e.currentTarget.clientWidth / 2) return;

          const event = new Event("dragstart", { bubbles: true });
          e.currentTarget.dispatchEvent(event);

          return;
        }

        let element = document.elementFromPoint(touch.pageX, touch.pageY);
        while (element && !element.classList.contains("dropzone")) {
          element = element.parentElement;
        }
        if (element && element != dropTarget) {
          setDropTarget(element);
        }
      }}
      onTouchEnd={(e) => {
        setStartTouch(undefined);
        if (!isDragging) return;

        e.currentTarget.dispatchEvent(new Event("dragend", { bubbles: true }));
        dropTarget?.dispatchEvent(new Event("drop", { bubbles: true }));
      }}
      onDragStart={(e: DragEvent<HTMLElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        props.setDraggedElement(e.currentTarget);
        setIsDragging(true);
      }}
      onDragEnd={(e) => {
        e.preventDefault();
        props.setDraggedElement(null);
        setIsDragging(false);
      }}
      draggable={!disabled}
      className="touch-none hover:cursor-move"
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
      className={`${
        props.className
      } dropzone m-2 rounded-lg transition-all duration-200 ease-linear ${
        props.dragged && !self?.current?.contains(props.dragged)
          ? "bg-layer-1 shadow-lg"
          : ""
      }`}
    >
      {props.children}
    </div>
  );
};
