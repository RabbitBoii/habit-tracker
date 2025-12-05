import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HEADER */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="p-6 h-16 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <Link className="flex items-center justify-center" href="#">
            <span className="font-bold text-xl">Habit<span className="text-primary">AI</span></span>
          </Link>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <ModeToggle />

          {/* Clerk Modal */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Log In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Crush Your Goals with <span className="text-primary">AI-Powered</span> Habits
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Stop planning and start doing. Let our AI break down your ambitious projects into bite-sized, actionable tasks.
                </p>
              </div>


              <div className="space-x-4">

                <SignedOut>
                  <SignUpButton>
                    <Button className="px-8" size="lg">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignUpButton>
                </SignedOut>


                <SignedIn>
                  <Link href='/dashboard'>
                    <Button className="px-8" size='lg'>
                      Go to Dashboard <ArrowRight className="ml-2 h-2 w-4" />
                    </Button>
                  </Link>
                </SignedIn>

                <Link href="https://github.com/RabbitBoii/habit-tracker">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 HabitAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}