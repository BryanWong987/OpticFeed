"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
    getCurrentUser,
    getPostById,
    addComment,
} from "@/app/lib/dal";

const CommentSchema = z.object({
    post_id: z.coerce.number().int().positive(),
    topic_slug: z.string().trim().min(1),
    comment_body: z.string()
        .trim()
        .min(1, "Please enter a comment.")
        .max(2000, "Comment body must be 2,000 characters or fewer."),
});

export interface CommentFormState {
    message?: string;
    errors?: {
        comment_body?: string[];
        post_id?: string[];
        topic_slug?: string[];
    };
}

export async function submitComment(
    _prevState: CommentFormState,
    formData: FormData
): Promise<CommentFormState> {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const validatedFields = CommentSchema.safeParse({
        post_id: formData.get("post_id"),
        topic_slug: formData.get("topic_slug"),
        comment_body: formData.get("comment_body"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const { post_id, topic_slug, comment_body } = validatedFields.data;

    let post;

    try {
        // Verify that the post exists and belongs to the specified topic.
        post = await getPostById(post_id, topic_slug);

        if (!post) {
            return {
                message: "Error: The post could not be found.",
            };
        }

        await addComment(
            user.user_id,
            post.post_id,
            comment_body
        );
    } catch (error) {
        console.error("Failed to submit comment:", error);

        return {
            message: "Something went wrong while submitting your comment.",
        };
    }

    redirect(`/topics/${post.topic_slug}/posts/${post.post_id}`);
}