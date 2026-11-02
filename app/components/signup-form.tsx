
'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)

    return (
        <div className="w-full">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Create an Account
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign up to get started.
                    </p>
                </div>

                <form action={action} className="space-y-5">

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        {state?.errors?.username && (
                            <p className="mt-2 text-sm text-red-600">
                                {state.errors.username.errors}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        {state?.errors?.email && (
                            <p className="mt-2 text-sm text-red-600">
                                {state.errors.email.errors}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        {state?.errors?.password && (
                            <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <p className="mb-1 font-medium">
                                    Password must:
                                </p>
                                <ul className="list-inside list-disc space-y-1">
                                    {state.errors.password.errors.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        disabled={pending}
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? 'Creating Account...' : 'Create Account'}
                    </button>

                </form>

            </div>
        </div>
    )
}
