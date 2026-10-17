import Image from "next/image";

export default function Home() {
  return (
    // <div className="flex flex-col flex-3 items-center justify-center bg-zinc-200 font-sans dark:bg-black">
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-xl">
        <p className="font-bold text-2xl">
          Stay on top of current news.
        </p>
        <p className="font-bold text-2xl">
          See all perspectives.
        </p>
        <p className="font-bold text-2xl">
          Discuss with locals.
        </p>

        <p className="text-sm py-4">
          Login to start connecting with your community today.
        </p>

        <button
          aria-label="Login Button"
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login/Sign Up
        </button>



      </div>




      <h1 className="text-2xl font-bold text-center px-4 py-4">Trending Posts</h1>
      <div className="mx-auto max-w-3xl flex">
        <article className="box-content h-30 w-3xl border-3 p-2">
          <h1 className="max-w-base text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Death Row Inmate Survives Execution Sentence
          </h1>
          <p className="max-w-base text-sm tracking-tight text-black dark:text-zinc-50">
            Christa Pike was sentenced to death by lethal injection for murder. However, she survived
            and is now recovering in the hospital in critical condition.
          </p>
        </article>
      </div>

      <div className="px-4 py-16"></div>


      <h1 className="text-2xl font-bold text-center px-4 py-4">Local Topics</h1>
      <div className="mx-auto max-w-3xl flex">
        <article className="box-content h-30 w-3xl border-3 p-2">
          <h1 className="max-w-base text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Nampa Tennis Club
          </h1>
          <p className="max-w-base text-sm tracking-tight text-black dark:text-zinc-50">
            All ages are welcome!
          </p>
        </article>
      </div>

      <div className="px-4 py-8"></div>

      <div className="mx-auto max-w-xl">
        <p className="font-bold text-2xl text-center">Suggest a Topic</p>
        <p className="text-sm text-center px-2 py-4">
          Is your topic not listed here? Feel free to suggest a topic of interest!
        </p>

        <div className="flex justify-center">
          <button
            aria-label="Suggest Topic Button"
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Suggest a Topic
          </button>
        </div>
      </div>


    </main>
    // </div>
  );
}
