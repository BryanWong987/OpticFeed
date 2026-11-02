import pool from "@/app/lib/db";
import Link from "next/link";

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

export default async function TopicsList() {
    const [rows] = await pool.execute(
        "SELECT * FROM topics ORDER BY topic_id DESC"
    );

    const topics = rows as Topic[];

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                Latest Topics
            </h1>
            
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
        </main>
    );
}