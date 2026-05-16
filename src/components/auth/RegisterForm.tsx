"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthStore } from "@/stores/authStore";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/Spinner";

const RegisterForm = () => {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        await register(name, email, password);
        if (useAuthStore.getState().isAuthenticated) {
            router.push("/chat");
        } else {
            console.error("Registration failed");
        }
    };
    return (
        <Card className="flex flex-col items-center justify-center w-full max-w-sm h-auto p-6 mx-4">
            <CardHeader className="items-center justify-center">
                <h1 className="text-4xl font-bold text-center">Tactica</h1>
                <p className="text-center text-sm text-muted-foreground">Create an account to get started</p>
            </CardHeader>
            <CardContent className="w-full">
                <form id="register-form" onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                    />
                    <Label htmlFor="email">Email</Label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                    />
                    <Label htmlFor="password">Password</Label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </form>
            </CardContent>
            <div className="flex flex-col items-center gap-2">
                <Button className="cursor-pointer" type="submit" form="register-form" disabled={isLoading}>
                    {isLoading ? <Spinner /> : "Register"}
                </Button>
                <p>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </div>
        </Card>
    );
};

export default RegisterForm;
