"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
    getCurrentUser,
    getPostById,
    getCommentById,
    addComment,
} from "@/app/lib/dal";

const CommentSchema = z.object({
    post_id: z.coerce.number().int().positive(),
    topic_slug: z.string().trim().min(1),
    comment_body: z.string()
        .trim()
        .min(1, "Please enter a comment.")
        .max(2000, "Comments must be 2,000 characters or fewer."),
});

const ReplySchema = z.object({
    post_id: z.coerce.number().int().positive(),
    parent_id: z.coerce.number().int().positive(),
    topic_slug: z.string().trim().min(1),
    comment_body: z.string()
        .trim()
        .min(1, "Please enter a reply.")
        .max(2000, "Replies must be 2,000 characters or fewer."),
});

export interface CommentFormState {
    message?: string;
    errors?: {
        comment_body?: string[];
        post_id?: string[];
        parent_id?: string[];
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
            null,
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


export async function submitReply(
    _prevState: CommentFormState,
    formData: FormData
): Promise<CommentFormState> {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const validatedFields = ReplySchema.safeParse({
        post_id: formData.get("post_id"),
        parent_id: formData.get("parent_id"),
        topic_slug: formData.get("topic_slug"),
        comment_body: formData.get("comment_body"),
    });

    if (!validatedFields.success) {
        return {
            errors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }

    const {
        post_id,
        parent_id,
        topic_slug,
        comment_body,
    } = validatedFields.data;

    try {
        const post = await getPostById(post_id, topic_slug);

        if (!post) {
            return { message: "The post could not be found." };
        }

        const parentComment = await getCommentById(parent_id);

        if (!parentComment || parentComment.post_id !== post.post_id) {
            return {
                message: "The comment you are replying to could not be found.",
            };
        }

        await addComment(
            user.user_id,
            post.post_id,
            parentComment.comment_id,
            comment_body
        );
    } catch (error) {
        console.error("Failed to submit reply:", error);

        return {
            message: "Something went wrong while submitting your reply.",
        };
    }

    redirect(`/topics/${topic_slug}/posts/${post_id}`);
}