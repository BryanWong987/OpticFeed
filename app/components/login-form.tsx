
'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function LoginForm() {
    const [state, action, pending] = useActionState(login, undefined)

    return (
        <div className="w-full">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Log in to your account.
                    </p>
                </div>

                <form action={action} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                            Username
                        </label>

                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            required
                            maxLength={20}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                        {state?.errors?.username && (
                            <p className="text-red-500 text-sm">
                                {state.errors.username.errors[0]}
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
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        {state?.errors?.password && (
                            <p className="mt-2 text-sm text-red-600">
                                {state.errors.password.errors}
                            </p>
                        )}
                    </div>

                    {/* General Login Error */}
                    {state?.message && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {state.message}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        disabled={pending}
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? 'Logging in...' : 'Log In'}
                    </button>

                </form>

            </div>
        </div>
    )
}
