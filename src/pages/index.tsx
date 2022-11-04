import type { NextPage } from "next";

import Image from "next/future/image";
import Head from "next/head";

import { trpc } from "@/utils/trpc";

import { Dashboard } from "@/components/Dashboard";
import { TaskBoard } from "@/components/TaskBoard";
import Toast, { Message, MessageContext } from "@/components/Toast";
import { useState } from "react";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.tasks.getAllStatuses.useQuery({
    includeTasks: true,
  });

  const [messageList, setMessageList] = useState<Message[]>([]);
  const addMessage = (message: Message) => {
    setMessageList((list) => {
      const lastId = list[list.length - 1]?.id ?? 0;
      message.id = lastId + 1;
      return [...list, message ];
    });
    setTimeout(() => {
      dismissMessage(message);
    }, 2000);
  };
  const dismissMessage = (message: Message) => {
    setMessageList(list => list.filter(m => m.id !== message.id))
  }

  return (
    <>
      <Head>
        <title>Task Manager</title>
        <meta name="description" content="WIP task manager web application" />
      </Head>

      <main className="flex min-h-screen min-w-full">
        <MessageContext.Provider value={{ addMessage: addMessage }}>
          <div>
            <Dashboard />
          </div>
          {isLoading || !data ? "Loading..." : <TaskBoard statusArray={data} />}
          <a
            href="https://github.com/LeBulldoge/task-manager"
            className="group fixed bottom-0 right-0 flex gap-1 place-self-end pr-3 pb-1 text-xs hover:underline"
          >
            <Image
              src="/GitHub-Mark-Light-32px.png"
              width={16}
              height={16}
              alt="GitHub Logo"
              className="group-hover:animate-spin"
            />
            GitHub
          </a>
          <Toast messageList={messageList} dismissHandler={dismissMessage} />
        </MessageContext.Provider>
      </main>
    </>
  );
};

export default Home;
