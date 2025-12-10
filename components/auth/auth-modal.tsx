"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    redirectPath?: string
    title?: string
    message?: string
}

export function AuthModal({ isOpen, onClose, onSuccess, title = "Create Account", message = "Please create an account to continue" }: AuthModalProps) {
    const { toast } = useToast()
    const [isLogin, setIsLogin] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLogin && formData.password !== formData.confirmPassword) {
            toast({ title: "Error", description: "Passwords don't match", variant: "destructive" })
            return
        }

        setIsLoading(true)
        try {
            if (isLogin) {
                // Login
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.detail || 'Login failed')

                localStorage.setItem('token', data.access_token)
                localStorage.setItem('user', JSON.stringify(data.user))
                // Trigger storage event for header to update
                window.dispatchEvent(new Event('storage'))
                toast({ title: "Welcome back!", description: `Logged in as ${data.user.first_name}` })
            } else {
                // Register
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        password: formData.password
                    })
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.detail || 'Registration failed')

                localStorage.setItem('token', data.access_token)
                localStorage.setItem('user', JSON.stringify(data.user))
                // Trigger storage event for header to update
                window.dispatchEvent(new Event('storage'))
                toast({ title: "Account Created!", description: `Welcome, ${data.user.first_name}!` })
            }

            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">{isLogin ? "Welcome Back" : title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{isLogin ? "Login to continue" : message}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="firstName" className="text-xs">First Name</Label>
                                <Input id="firstName" required value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="h-10" placeholder="John" />
                            </div>
                            <div>
                                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                                <Input id="lastName" required value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="h-10" placeholder="Doe" />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="email" className="text-xs">Email</Label>
                        <Input id="email" type="email" required value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-10" placeholder="john@example.com" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="text-xs">Password</Label>
                        <Input id="password" type="password" required value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-10" placeholder="••••••••" />
                    </div>

                    {!isLogin && (
                        <div>
                            <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" required value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="h-10" placeholder="••••••••" />
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {isLogin ? "Login" : "Create Account"}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </div>
            </div>
        </div>
    )
}
