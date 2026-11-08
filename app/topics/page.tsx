import { connection } from "next/server";
import pool from "@/app/lib/db";
import Link from "next/link";
import { Suspense } from "react";

type Status = "pending" | "approved";

// TODO change interface field names to match database field names
interface Topic {
    topic_id: number;
    type: string;
    title: string;
    slug: string; // slug of topic title (ex. title-in-slug-format)
    status: Status;
    interested_count: number;
    body: string;
}

export default async function Topics() {
    return (
            <main className="max-w-3xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">
                    Search News
                </h1>
    
                <Suspense fallback={<p>Loading search results...</p>}>
                    <TopicsList/>
                </Suspense>
            </main>
        );
}

async function TopicsList() {
    // Tell Next.js to wait for an incoming request before querying the database
    await connection();

    const [rows] = await pool.execute(
        "SELECT * FROM topics ORDER BY topic_id DESC"
    );

    const topics = rows as Topic[];

    return (
        <>
            <div className="space-y-4">
                {topics.map((topic) => (
                    <Link
                        key={topic.topic_id}
                        href={`/topics/${topic.slug}`}
                        className="block p-4 bg-white shadow rounded-lg hover:bg-gray-100"
                    >
                        <h2 className="text-xl font-semibold">
                            {topic.title}
                        </h2>
                    </Link>
                ))}
            </div>
        </>
    );
}