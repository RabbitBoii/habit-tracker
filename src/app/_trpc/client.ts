import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/server"; // 👈 We only import the TYPE, not the code

export const trpc = createTRPCReact<AppRouter>();