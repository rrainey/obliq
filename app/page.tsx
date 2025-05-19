'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import LogoutButton from '@/lib/auth/LogoutButton';

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">obliq</h1>
        <p>Visual Modeling & Simulation Web App</p>
      </div>

      <div className="mt-6 w-full max-w-lg">
        {isLoading ? (
          <p>Loading authentication state...</p>
        ) : user ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
              <LogoutButton />
            </div>
            <p className="mb-4">You are currently logged in.</p>
            <div className="mt-6">
              <Link
                href="/editor"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Go to Editor
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Welcome to obliq</h2>
            <p className="mb-4">Please sign in or create an account to continue.</p>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}