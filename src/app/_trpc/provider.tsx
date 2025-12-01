"use client"; // 👈 Crucial: Providers must run on the client

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./client";
import superjson from "superjson";

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
    // 1. Create a React Query Client (The Cache)
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Data is considered "fresh" for 5 seconds to prevent spamming the server
                staleTime: 5 * 1000,
            },
        },
    }));

    // 2. Create the tRPC Client (The Network Link)
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "http://localhost:3000/api/trpc", // 👈 The URL of our API Handler
                    transformer: superjson, // 👈 Allows us to pass Date objects seamlessly
                }),
            ],
        })
    );

    // 3. Wrap the app
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}