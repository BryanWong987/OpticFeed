
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CommentForm from "@/app/components/comment-form";
import CommentThread from "@/app/components/comment-thread";

import {
    getPostById,
    getCommentsByPostId,
    type PostComment,
} from "@/app/lib/dal";


interface PostPageProps {
    params: Promise<{
        slug: string;
        post_id: string;
    }>;
}


interface CommentNode extends PostComment {
    replies: CommentNode[];
}

function buildCommentTree(comments: PostComment[]): CommentNode[] {
    const commentMap = new Map<number, CommentNode>();

    // Create a node for every comment.
    for (const comment of comments) {
        commentMap.set(comment.comment_id, {
            ...comment,
            replies: [],
        });
    }

    const topLevelComments: CommentNode[] = [];

    // Attach each reply to its parent comment.
    for (const comment of commentMap.values()) {
        if (comment.parent_id === null) {
            topLevelComments.push(comment);
        } else {
            const parent = commentMap.get(comment.parent_id);

            if (parent) {
                parent.replies.push(comment);
            }
        }
    }

    return topLevelComments;
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

    // Retrieve comments
    const allComments = await getCommentsByPostId(post.post_id);
    const comments = buildCommentTree(allComments);

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
                    Comments ({allComments.length})
                </h2>

                <div className="mb-8 rounded-lg bg-white p-5 shadow-sm">
                    <CommentForm
                        postId={post.post_id}
                        topicSlug={post.topic_slug}
                    />
                </div>

                <CommentThread
                    comments={comments}
                    postId={post.post_id}
                    topicSlug={post.topic_slug}
                />
            </section>

        </div>
    );
}
