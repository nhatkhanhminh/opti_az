// global-error.tsx
"use client";

import { Button } from "@/components/ui/button";
import NextError from "next/error";
import Link from "next/link";
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <div className=" flex items-center justify-center  text-foreground p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="text-3xl font-bold">Something Went Wrong</h1>
            <p className="text-muted-foreground">
          An unexpected error occurred. Our team has been notified, and we’re working to fix it.
        </p>
            {/* <NextError statusCode={0} /> */}
            <div className="space-y-4">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
          </div>
        </div>
      </body>
    </html>
  );
}