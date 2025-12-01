"use client";

import { trpc } from "@/app/_trpc/client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  // This hook will fail if you aren't logged in, that's expected!
  const { data: user, isLoading } = trpc.user.getMe.useQuery();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
      <h1 className="text-4xl font-bold">Frontend Bridge 🌉</h1>

      {/* SHOW THIS IF LOGGED OUT */}
      <SignedOut>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="mb-4 text-lg">You are strictly logged out!</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Sign In with Clerk
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* SHOW THIS IF LOGGED IN */}
      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <UserButton />

          <div className="p-6 bg-white border rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold text-slate-600 mb-4">User Data from DB:</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <pre className="p-4 bg-gray-800 text-green-400 rounded-md text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            )}
          </div>

          <p className="text-gray-600 font-medium">
            Credits: {user?.credits ?? 0}
          </p>
        </div>
      </SignedIn>
    </div>
  );
}