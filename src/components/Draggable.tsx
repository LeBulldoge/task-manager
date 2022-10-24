export const Draggable = (props: {
  children?: React.ReactNode;
  setDragged: (element: HTMLElement | null) => void;
}) => {
  return (
    <div
      onDragStart={(e) => {
        props.setDragged(e.target as HTMLElement);
      }}
      onDragEnd={() => {
        props.setDragged(null);
      }}
      draggable="true"
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

        const element = e.currentTarget as HTMLElement;
        if (props.dragged && !element.contains(props.dragged)) {
          element.prepend(props.dragged);
        }
      }}
      className={props.className}
    >
      {props.children}
    </div>
  );
};
