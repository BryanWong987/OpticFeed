
import { Suspense } from "react";
import pool from "@/app/lib/db";
import { notFound } from "next/navigation";

type Status = "pending" | "approved";

interface Topic {
    topic_id: number;
    type: string;
    title: string;
    slug: string; // slug of topic title (ex. title-in-slug-format)
    status: Status;
    interested_count: number;
    topic_body: string;
}

export default function NewsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <Suspense fallback={<p>Loading topic...</p>}>
                <TopicContent params={params} />
            </Suspense>
        </main>
    );
}

async function TopicContent({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [rows] = await pool.execute(
        "SELECT * FROM topics WHERE slug = ?",
        [slug]
    );

    const articles = rows as Topic[];

    if (articles.length === 0) {
        notFound();
    }

    const article = articles[0];

    return (
        <article className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-4">
                {article.title}
            </h1>

            <p className="text-gray-700 whitespace-pre-wrap">
                {article.topic_body}
            </p>
        </article>
    );
}
