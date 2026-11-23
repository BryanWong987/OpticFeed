// Component that displays comments and replies.
"use client";

import { useState, useActionState } from "react";
import {
    submitReply,
    type CommentFormState,
} from "@/app/actions/comments";

interface CommentNode {
    comment_id: number;
    parent_id: number | null;
    post_id: number;
    user_id: number;
    comment_body: string;
    username: string;
    replies: CommentNode[];
}

interface CommentThreadProps {
    comments: CommentNode[];
    postId: number;
    topicSlug: string;
}

export default function CommentThread({
    comments,
    postId,
    topicSlug,
}: CommentThreadProps) {
    if (comments.length === 0) {
        return (
            <p className="text-gray-600">
                No comments yet. Be the first to comment!
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.comment_id}
                    comment={comment}
                    postId={postId}
                    topicSlug={topicSlug}
                />
            ))}
        </div>
    );
}

interface CommentItemProps {
    comment: CommentNode;
    postId: number;
    topicSlug: string;
}

function CommentItem({
    comment,
    postId,
    topicSlug,
}: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
        <div className="space-y-3">
            <article className="rounded-lg bg-white p-5 shadow-sm">
                <p className="mb-2 font-semibold text-gray-800">
                    {comment.username}
                </p>

                <p className="whitespace-pre-wrap text-gray-700">
                    {comment.comment_body}
                </p>

                <button
                    type="button"
                    onClick={() => setShowReplyForm((previous) => !previous)}
                    className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                    {showReplyForm ? "Cancel" : "Reply"}
                </button>

                {showReplyForm && (
                    <ReplyForm
                        postId={postId}
                        parentId={comment.comment_id}
                        topicSlug={topicSlug}
                    />
                )}
            </article>

            {comment.replies.length > 0 && (
                <div className="ml-5 space-y-3 border-l-2 border-gray-200 pl-4 sm:ml-8">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.comment_id}
                            comment={reply}
                            postId={postId}
                            topicSlug={topicSlug}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ReplyFormProps {
    postId: number;
    parentId: number;
    topicSlug: string;
}

function ReplyForm({
    postId,
    parentId,
    topicSlug,
}: ReplyFormProps) {
    const initialState: CommentFormState = {};

    const [state, formAction, pending] = useActionState(
        submitReply,
        initialState
    );

    return (
        <form action={formAction} className="mt-4 space-y-3">
            <input
                type="hidden"
                name="post_id"
                value={postId}
            />

            <input
                type="hidden"
                name="parent_id"
                value={parentId}
            />

            <input
                type="hidden"
                name="topic_slug"
                value={topicSlug}
            />

            <textarea
                name="comment_body"
                rows={3}
                required
                maxLength={2000}
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {state.errors?.comment_body && (
                <p className="text-sm text-red-600">
                    {state.errors.comment_body[0]}
                </p>
            )}

            {state.message && (
                <p className="text-sm text-red-600">
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "Submitting..." : "Submit Reply"}
            </button>
        </form>
    );
}