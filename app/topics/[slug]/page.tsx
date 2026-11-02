import pool from "@/app/lib/db";
import { notFound } from "next/navigation";

type Status = "pending" | "approved"; // Status of the topic

// TODO change interface field names to match database field names
interface Topic {
    id: number;
    type: string;
    title: string; 
    slug: string; // slug of topic title (ex. title-in-slug-format)
    status: Status;
    interested_count: number;
    topic_body: string;
}

export default async function TopicPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [rows] = await pool.execute(
        "SELECT * FROM topics WHERE slug = ?",
        [slug]
    );

    const topic = rows as Topic[];

    // Check whether the article exists
    if (topic.length === 0) {
        notFound();
    }

    const article = topic[0];

    return (
        <main className="max-w-3xl mx-auto p-6">
            <article className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-4">
                    {article.title}
                </h1>

                <p className="text-gray-700 whitespace-pre-wrap">
                    {article.topic_body}
                </p>
            </article>
        </main>
    );
}