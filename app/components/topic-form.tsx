"use client";

import { useActionState } from "react";
import {
    submitTopic,
    type TopicFormState,
} from "@/app/actions/topics";

const initialState: TopicFormState = {};

export default function TopicForm() {
    const [state, formAction, pending] = useActionState(
        submitTopic,
        initialState
    );

    return (
        <form action={formAction} className="space-y-6">

            {/* Topic Name */}
            <div>
                <label
                    htmlFor="title"
                    className="mb-2 block font-semibold text-gray-800"
                >
                    Topic Name
                </label>

                <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength={100}
                    required
                    placeholder="Enter a topic name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                {state.errors?.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.title[0]}
                    </p>
                )}
            </div>

            {/* Topic Purpose */}
            <fieldset>
                <legend className="mb-3 font-semibold text-gray-800">
                    Topic Purpose
                </legend>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="radio"
                            name="topic_type"
                            value="Networking"
                            required
                            className="h-4 w-4 accent-blue-600"
                        />
                        Networking
                    </label>

                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="radio"
                            name="topic_type"
                            value="Informative"
                            className="h-4 w-4 accent-blue-600"
                        />
                        Informative
                    </label>
                </div>

                {state.errors?.topic_type && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.topic_type[0]}
                    </p>
                )}
            </fieldset>

            {/* Topic Body */}
            <div>
                <label
                    htmlFor="topic_body"
                    className="mb-2 block font-semibold text-gray-800"
                >
                    Topic Body
                </label>

                <textarea
                    id="topic_body"
                    name="topic_body"
                    rows={8}
                    maxLength={5000}
                    required
                    placeholder="Describe your suggested topic..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                {state.errors?.topic_body && (
                    <p className="mt-1 text-sm text-red-600">
                        {state.errors.topic_body[0]}
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
                {pending ? "Submitting..." : "Add Topic"}
            </button>
        </form>
    );
}