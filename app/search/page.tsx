import { Suspense } from "react";
import pool from "@/app/lib/db";
import Link from "next/link";

type Status = "pending" | "approved"; // Status of the topic

interface Topic {
    topic_id: number;
    type: string;
    title: string;
    slug: string; // slug of topic title (ex. title-in-slug-format)
    status: Status;
    interested_count: number;
    body: string;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                Search News
            </h1>

            <Suspense fallback={<p>Loading search results...</p>}>
                <SearchResults searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function SearchResults({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const searchQuery = q?.trim() ?? "";

    let topics: Topic[] = [];

    if (searchQuery) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM topics
             WHERE title LIKE ? OR topic_body LIKE ?
             ORDER BY topic_id DESC`,
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );

        topics = rows as Topic[];
    }

    return (
        <>

            <form action="/search" method="GET" className="mb-8">
                <input
                    type="search"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="Search topics..."
                    className="w-full p-3 border rounded-lg"
                />

                <button
                    type="submit"
                    className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Search
                </button>
            </form>

            {searchQuery && (
                <h2 className="text-xl font-semibold mb-4">
                    Search results for: "{searchQuery}"
                </h2>
            )}

            {!searchQuery ? (
                <p className="text-gray-500">
                    Enter a search term to find articles.
                </p>
            ) : topics.length === 0 ? (
                <p className="text-gray-500">
                    No topics were found.
                </p>
            ) : (
                <div className="space-y-4">
                    {topics.map((topic) => (
                        <Link
                            key={topic.topic_id}
                            href={`/news/${topic.slug}`}
                            className="block p-4 border rounded-lg hover:bg-gray-50"
                        >
                            <h3 className="text-xl font-semibold">
                                {topic.title}
                            </h3>

                            <p className="mt-2 text-gray-600 line-clamp-2">
                                {topic.body}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}