"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser, addTopic } from "@/app/lib/dal";

const TopicSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Please enter a topic name.")
        .max(100, "Topic name must be 100 characters or fewer."),

    topic_type: z.enum(["Networking", "Informative"], {
        error: "Please select a topic purpose.",
    }),

    topic_body: z.string()
        .trim()
        .min(1, "Please enter a topic description.")
        .max(2000, "Topic description must be 2,000 characters or fewer."),
});

export interface TopicFormState {
    message?: string;
    errors?: {
        title?: string[];
        topic_type?: string[];
        topic_body?: string[];
    };
}

export async function submitTopic(
    _prevState: TopicFormState,
    formData: FormData
): Promise<TopicFormState> {
    // Verify authentication on the server.
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const validatedFields = TopicSchema.safeParse({
        title: formData.get("title"),
        topic_type: formData.get("topic_type"),
        topic_body: formData.get("topic_body"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const { title, topic_type, topic_body } = validatedFields.data;

    try {
        await addTopic(user.user_id, title, topic_type, "Published", topic_body);
    } catch (error) {
        console.error("Failed to submit topic:", error);

        return {
            message: "Something went wrong while submitting your topic.",
        };
    }

    redirect("/topics");
}