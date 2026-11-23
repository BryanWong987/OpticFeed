"use client";

import { useActionState } from "react";
import {
    submitComment,
    type CommentFormState,
} from "@/app/actions/comments";

const initialState: CommentFormState = {};

interface CommentFormProps {
    postId: number;
    topicSlug: string;
}

export default function CommentForm({
    postId,
    topicSlug,
}: CommentFormProps) {
    const [state, formAction, pending] = useActionState(
        submitComment,
        initialState
    );

    return (
        <form action={formAction} className="space-y-4">
            <input
                type="hidden"
                name="post_id"
                value={postId}
            />

            <input
                type="hidden"
                name="topic_slug"
                value={topicSlug}
            />

            <div>
                <label
                    htmlFor="comment_body"
                    className="mb-2 block font-medium text-gray-700"
                >
                    Add Your Comment
                </label>

                <textarea
                    id="comment_body"
                    name="comment_body"
                    rows={2}
                    required
                    placeholder="Comment body"
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />

                {state.errors?.comment_body && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.comment_body[0]}
                    </p>
                )}
            </div>

            {state.message && (
                <p className="text-sm text-red-600">
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "Submitting..." : "Submit Comment"}
            </button>
        </form>
    );
}