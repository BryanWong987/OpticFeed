
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
    getCurrentUser,
    addPost,
    getTopicById,
} from "@/app/lib/dal";


const PostSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Please enter a post title.")
        .max(200, "Post title must be 200 characters or fewer."),

    post_type: z.enum(["News", "Discussion"], {
        error: "Please select a post type.",
    }),

    news_links: z.string()
        .trim()
        .optional(),

    post_body: z.string()
        .trim()
        .min(1, "Please enter your post.")
        .max(2000, "Post body must be 2,000 characters or fewer."),

    topic_id: z.coerce.number()
        .int("Invalid topic ID.")
        .positive("Invalid topic ID."),
}).superRefine((data, ctx) => { // Validate news links
    if (data.post_type === "News") {
        if (!data.news_links) {
            ctx.addIssue({
                code: "custom",
                path: ["news_links"],
                message: "Please enter at least one news link.",
            });

            return;
        }

        const links = data.news_links
            .split("\n")
            .map(link => link.trim())
            .filter(Boolean);

        for (const link of links) {
            try {
                const url = new URL(link);

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Invalid protocol");
                }
            } catch {
                ctx.addIssue({
                    code: "custom",
                    path: ["news_links"],
                    message: "Please enter valid HTTP or HTTPS URLs.",
                });

                break;
            }
        }
    }
});

export interface PostFormState {
    message?: string;
    errors?: {
        title?: string[];
        post_type?: string[];
        news_links?: string[];
        post_body?: string[];
    };
}

export async function submitPost(
    _prevState: PostFormState,
    formData: FormData
): Promise<PostFormState> {

    // Verify authentication on the server.
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const validatedFields = PostSchema.safeParse({
        title: formData.get("title"),
        post_type: formData.get("post_type"),
        news_links: formData.get("news_links") ?? "",
        post_body: formData.get("post_body"),
        topic_id: formData.get("topic_id"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const {
        topic_id,
        title,
        post_type,
        news_links,
        post_body
    } = validatedFields.data;

    let topicSlug: string;

    try {
        await addPost(
            user.user_id,
            topic_id,
            title,
            post_type,
            post_type === "News" ? news_links ?? null : null,
            post_body
        );

        // Retrieve the topic slug for redirection.
        const topic = await getTopicById(topic_id);

        if (!topic) {
            return {
                message: "Post created, but the associated topic could not be found.",
            };
        }

        topicSlug = topic.slug;

    } catch (error) {
        console.error("Failed to submit post:", error);

        return {
            message: "Something went wrong while submitting your post.",
        };
    }

    redirect(`/topics/${topicSlug}`);
}
