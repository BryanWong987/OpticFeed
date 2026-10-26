'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function SignupForm() {
    const [state, action, pending] = useActionState(signup, undefined)
    return (
        <form action={action} className="mb-4 gap-2">
            <div>
                <label htmlFor="username">Username</label>
                <input id="username" className="border p-1" name="username" placeholder="Username" />
            </div>
            {state?.errors?.username && <p>{state.errors.username.errors}</p>}
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" className="border p-1" name="email" placeholder="Email" />
            </div>
            {state?.errors?.email && <p>{state.errors.email.errors}</p>}
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" className="border p-1" name="password" type="password" />
            </div>
            {state?.errors?.password && (
                <div>
                    <p>Password must:</p>
                    <ul>
                        {state.errors.password.errors.map((error) => (
                            <li key={error}>- {error}</li>
                        ))}
                    </ul>
                </div>
            )}
            <button disabled={pending} type="submit" className="bg-blue-500 text-white p-1 px-3">
                Sign Up
            </button>
        </form>
    )
}