"use client"; 

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./client";
import superjson from "superjson";

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
    // Create a React Query Client 
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 1000,
            },
        },
    }));

    // Create the tRPC Client 
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "http://localhost:3000/api/trpc", 
                    transformer: superjson, 
                }),
            ],
        })
    );

    // Wrap the app
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}