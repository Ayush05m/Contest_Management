"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { register } from "@/lib/redux/slices/authSlice"

// Import the LoadingButton
import { LoadingButton } from "@/components/ui/loading-button"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const router = useRouter()

  // Add this at the top of the component
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  if (typeof window !== "undefined" && isAuthenticated) {
    router.push("/contests")
  }

  // Update the handleSubmit function with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await dispatch(register({ name, email, password })).unwrap()
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      })
      router.push("/contests")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: typeof error === "string" ? error : "An error occurred during registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {/* Update the submit button to show loading state */}
              <LoadingButton type="submit" isLoading={isSubmitting || loading} loadingText="Creating account...">
                Create Account
              </LoadingButton>
            </div>
          </form>
        </div>
        <div className="px-8 text-center text-sm text-muted-foreground">
          <div className="underline hover:text-primary">
            <Link href="/auth/login">Already have an account? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

