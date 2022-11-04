import type { NextPage } from "next";

import Image from "next/future/image";
import Head from "next/head";

import { trpc } from "@/utils/trpc";

import { Dashboard } from "@/components/Dashboard";
import { TaskBoard } from "@/components/TaskBoard";

const Home: NextPage = () => {

  const { data, isLoading } = trpc.tasks.getAllStatuses.useQuery({
    includeTasks: true,
  });

  return (
    <>
      <Head>
        <title>Task Manager</title>
        <meta name="description" content="WIP task manager web application" />
      </Head>

      <main className="flex min-h-screen min-w-full">
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
      </main>
    </>
  );
};

export default Home;
