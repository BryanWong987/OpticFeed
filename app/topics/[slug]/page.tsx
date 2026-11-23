
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
    getPostsByTopicId,
    type Post
} from "@/app/lib/dal";

import pool from "@/app/lib/db";

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

export default function TopicPage({
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

    const posts = await getPostsByTopicId(article.topic_id);

    return (
        <>
            {/* Topic Information */}
            <article className="rounded-lg bg-background p-6 shadow-md">
                <h1 className="mb-4 text-3xl font-bold">
                    {article.title}
                </h1>

                <p className="whitespace-pre-wrap text-gray-700">
                    {article.topic_body}
                </p>

                {/* Create Post Button */}
                <div className="mt-6">
                    <Link
                        href={`/topics/${article.slug}/create-post`}
                        className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Create Post
                    </Link>
                </div>
            </article>

            {/* Topic Posts */}
            <section className="mt-8">
                <h2 className="mb-5 text-2xl font-bold">
                    Posts
                </h2>

                {posts.length === 0 ? (
                    <p className="text-gray-600">
                        No posts have been created for this topic yet.
                    </p>
                ) : (
                    <div className="space-y-5">
                        {posts.map((post) => (
                            <article
                                key={post.post_id}
                                className="rounded-lg bg-background p-6 shadow-md"
                            >
                                {/* Post Type */}
                                <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                    {post.post_type}
                                </span>

                                {/* Post Title */}
                                <h3 className="mb-3 text-xl font-bold">
                                    <Link
                                        href={`/topics/${article.slug}/posts/${post.post_id}`}
                                        className="hover:text-blue-600 hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                </h3>

                                {/* News Links */}
                                {post.post_type === "News" &&
                                    post.news_links && (
                                        <div className="mb-4">
                                            <h4 className="mb-2 font-semibold">
                                                News Sources
                                            </h4>

                                            <ul className="list-inside list-disc space-y-1">
                                                {post.news_links
                                                    .split(/\r?\n/)
                                                    .filter(Boolean)
                                                    .map((link, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="break-all text-blue-600 hover:underline"
                                                            >
                                                                {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}

                                {/* Post Body */}
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {post.post_body}
                                </p>

                                {/* Post Statistics */}
                                <div className="mt-5 flex gap-5 border-t pt-4 text-sm text-gray-500">
                                    <span>
                                        Views: {post.views}
                                    </span>

                                    <span>
                                        Comments: {post.comments}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
