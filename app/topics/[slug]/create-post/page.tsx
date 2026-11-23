
import { Suspense } from "react";
import { notFound } from "next/navigation";
import pool from "@/app/lib/db";
import PostForm from "@/app/components/post-form";

interface Topic {
    topic_id: number;
    title: string;
}

export default function CreatePostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <main className="mx-auto max-w-3xl p-6">
            <Suspense fallback={<p>Loading...</p>}>
                <CreatePostContent params={params} />
            </Suspense>
        </main>
    );
}

async function CreatePostContent({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [rows] = await pool.execute(
        "SELECT topic_id, title FROM topics WHERE slug = ?",
        [slug]
    );

    const topics = rows as Topic[];

    if (topics.length === 0) {
        notFound();
    }

    const topic = topics[0];

    // TODO: restrict post creation to only users since it requires a user
    
    return (
        <section className="rounded-lg bg-background p-6 shadow-md">
            <h1 className="mb-2 text-2xl font-bold">
                Create a Post
            </h1>

            <p className="mb-6 text-gray-600">
                Creating a post under:{" "}
                <span className="font-semibold">
                    {topic.title}
                </span>
            </p>

            <PostForm topicId={topic.topic_id} />
        </section>
    );
}
