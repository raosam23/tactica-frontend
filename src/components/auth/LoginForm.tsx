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
import { ApiError } from "@/lib/error";
import { useSnackbar } from "notistack";

const LoginForm = () => {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const { enqueueSnackbar } = useSnackbar();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await login(email, password);
            enqueueSnackbar("Login Successful!", { variant: "success" });
            router.push("/chat");
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                enqueueSnackbar(error.message, { variant: "error" });
            } else {
                enqueueSnackbar("An unexpected error occurred", { variant: "error" });
            }
        }
    };
    return (
        <Card className="flex flex-col items-center justify-center w-full max-w-sm h-auto p-6 mx-4">
            <CardHeader className="items-center justify-center">
                <h1 className="text-4xl font-bold text-center">Tactica</h1>
                <p className="text-center text-sm text-muted-foreground">Login to your account</p>
            </CardHeader>
            <CardContent className="w-full">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        type="email"
                        id="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    <Label htmlFor="password">Password</Label>
                    <Input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    <Button className="cursor-pointer w-full" disabled={isLoading} type="submit">
                        {isLoading ? <Spinner /> : "Login"}
                    </Button>
                    <p className="text-center text-sm">
                        Don&apos;t have an account? <Link href="/register">Register</Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
