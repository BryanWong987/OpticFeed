
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CommentForm from "@/app/components/comment-form";

import {
    getPostById,
    getTopLevelCommentsByPostId,
} from "@/app/lib/dal";

interface PostPageProps {
    params: Promise<{
        slug: string;
        post_id: string;
    }>;
}

export default function PostPage({ params }: PostPageProps) {
    return (
        <main className="mx-auto max-w-3xl p-6">
            <Suspense fallback={<p>Loading post...</p>}>
                <PostContent params={params} />
            </Suspense>
        </main>
    );
}

async function PostContent({ params }: PostPageProps) {
    const { slug, post_id } = await params;

    // Validate the post ID.
    const postId = Number(post_id);

    if (!Number.isSafeInteger(postId) || postId <= 0) {
        notFound();
    }

    // Retrieve the post.
    const post = await getPostById(postId, slug);

    if (!post) {
        notFound();
    }

    // Retrieve top-level comments.
    const comments = await getTopLevelCommentsByPostId(post.post_id);

    // Split news links into individual URLs.
    const newsLinks = post.news_links
        ? post.news_links.split(/\r?\n/).filter(Boolean)
        : [];

    return (
        <div className="space-y-8">

            {/* Post */}
            <article className="rounded-lg bg-white p-6 shadow-md">

                {/* Parent Topic */}
                <p className="mb-3 text-sm text-gray-500">
                    Topic: {post.topic_title}
                </p>

                {/* Post Type */}
                <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {post.post_type}
                </span>

                {/* Post Title */}
                <h1 className="mb-3 text-3xl font-bold">
                    {post.title}
                </h1>

                {/* Post Creator */}
                <p className="mb-6 text-sm text-gray-500">
                    Posted by {post.creator_username}
                </p>

                {/* News Links */}
                {post.post_type === "News" && newsLinks.length > 0 && (
                    <div className="mb-6">
                        <h2 className="mb-2 font-semibold">
                            News Sources
                        </h2>

                        <ul className="list-inside list-disc space-y-2">
                            {newsLinks.map((link, index) => (
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
                <div className="whitespace-pre-wrap text-gray-700">
                    {post.post_body}
                </div>

                {/* Post Statistics */}
                <div className="mt-6 flex gap-5 border-t pt-4 text-sm text-gray-500">
                    <span>Views: {post.views}</span>
                    <span>Comments: {post.comments}</span>
                </div>

            </article>

            {/* Comments */}
            <section>
                <h2 className="mb-5 text-2xl font-bold">
                    Comments ({comments.length})
                </h2>

                <div className="mb-8 rounded-lg bg-white p-5 shadow-sm">
                    <CommentForm
                        postId={post.post_id}
                        topicSlug={post.topic_slug}
                    />
                </div>

                {comments.length === 0 ? (
                    <p className="text-gray-600">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <article
                                key={comment.comment_id}
                                className="rounded-lg bg-white p-5 shadow-sm"
                            >
                                {/* Comment Author */}
                                <p className="mb-2 font-semibold text-gray-800">
                                    {comment.username}
                                </p>

                                {/* Comment Body */}
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {comment.comment_body}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}
