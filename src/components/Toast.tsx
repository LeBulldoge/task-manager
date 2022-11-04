import React from "react";

export interface Message {
  id?: number;
  type: "error" | "info";
  title: string;
  text: string;
}

interface ToastProps {
  messageList: Message[];
  dismissHandler: (message: Message) => void;
}

const Toast = ({ messageList, dismissHandler }: ToastProps) => {
  return (
    <div
      className={`fixed bottom-2 left-0 right-0 z-50 flex flex-col gap-3 transition-all ease-linear ${
        messageList.length === 0 ? "translate-y-full" : ""
      }`}
    >
      {messageList.map((message) => {
        return (
          <div
            key={message.id}
            onClick={() => dismissHandler(message)}
            className={`mx-auto hover:cursor-pointer shadow opacity-75 backdrop-blur-lg flex w-fit flex-col rounded-xl py-2 px-4 text-center text-sm ${
              message.type === "error"
                ? "bg-error text-error-text"
                : "bg-surface-inverse text-surface-inverse-text"
            }`}
          >
            <strong className="mb-2">{message.title}</strong>
            <p>{message.text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;

export const MessageContext = React.createContext<{
  addMessage: (message: Message) => void;
} | null>(null);
