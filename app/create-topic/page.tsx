import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/dal";
import TopicForm from "@/app/components/topic-form";

export default function SuggestTopicPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-12">
            <Suspense fallback={<p>Loading topic submission form...</p>}>
                <ProtectedTopicForm />
            </Suspense>
        </main>
    );
}

async function ProtectedTopicForm() {
    const user = await getCurrentUser();

    // Redirect users who are not logged in.
    if (!user) {
        redirect("/login");
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Suggest a News Topic
            </h1>

            <p className="mb-8 text-gray-600">
                Have an idea for a news topic? Submit it below!
            </p>

            <TopicForm />
        </div>
    );
}