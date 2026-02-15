import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
