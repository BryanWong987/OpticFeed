
"use client";

import { useState, useActionState } from "react";
import {
    submitPost,
    type PostFormState,
} from "@/app/actions/posts";

interface PostFormProps {
    topicId: number;
}

const initialState: PostFormState = {};

export default function PostForm({ topicId }: PostFormProps) {
    const [state, formAction, pending] = useActionState(
        submitPost,
        initialState
    );

    const [postType, setPostType] = useState("News");

    return (
        <form action={formAction} className="space-y-6">
            {/* Associated Topic */}
            <input
                type="hidden"
                name="topic_id"
                value={topicId}
            />

            {/* Post Title */}
            <div>
                <label
                    htmlFor="title"
                    className="mb-2 block font-semibold text-gray-800"
                >
                    Post Title
                </label>

                <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength={200}
                    required
                    placeholder="Enter a post title"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                {state.errors?.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.title[0]}
                    </p>
                )}
            </div>

            {/* Post Type */}
            <fieldset>
                <legend className="mb-3 font-semibold text-gray-800">
                    Post Type
                </legend>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="radio"
                            name="post_type"
                            value="News"
                            checked={postType === "News"}
                            onChange={() => setPostType("News")}
                            required
                            className="h-4 w-4 accent-blue-600"
                        />
                        News
                    </label>

                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="radio"
                            name="post_type"
                            value="Discussion"
                            checked={postType === "Discussion"}
                            onChange={() => setPostType("Discussion")}
                            className="h-4 w-4 accent-blue-600"
                        />
                        Discussion
                    </label>
                </div>

                {state.errors?.post_type && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.post_type[0]}
                    </p>
                )}
            </fieldset>

            {/* News Links (Only Visible for News) */}
            {postType === "News" && (
                <div>
                    <label
                        htmlFor="news_links"
                        className="mb-2 block font-semibold text-gray-800"
                    >
                        News Links
                    </label>

                    <textarea
                        id="news_links"
                        name="news_links"
                        rows={3}
                        placeholder="Enter news links, one per line..."
                        required
                        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    {state.errors?.news_links && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.news_links[0]}
                        </p>
                    )}
                </div>
            )}

            {/* Post Body */}
            <div>
                <label
                    htmlFor="post_body"
                    className="mb-2 block font-semibold text-gray-800"
                >
                    Post Body
                </label>

                <textarea
                    id="post_body"
                    name="post_body"
                    rows={8}
                    maxLength={2000}
                    required
                    placeholder="Write your post..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                {state.errors?.post_body && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.post_body[0]}
                    </p>
                )}
            </div>

            {/* General Error */}
            {state.message && (
                <p className="text-sm text-red-600">
                    {state.message}
                </p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "Submitting..." : "Create Post"}
            </button>

        </form>
    );
}
