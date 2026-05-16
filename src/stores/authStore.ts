import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import { create } from "zustand";

import api from "@/lib/api";
import { User } from "@/types";

import { ApiError } from "@/lib/error";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<void>;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post("/auth/login", { email, password });
            const { access_token } = response.data;
            Cookies.set("token", access_token, { expires: 10 });
            const profileResponse = await api.get("/auth/me");
            set({
                isAuthenticated: true,
                user: profileResponse.data,
            });
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to login", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isLoading: false });
        }
    },
    logout: () => {
        Cookies.remove("token");
        set({
            user: null,
            isAuthenticated: false,
        });
    },
    register: async (name, email, password) => {
        set({ isLoading: true });
        try {
            await api.post("/auth/register", { name, email, password });
            await useAuthStore.getState().login(email, password);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (isAxiosError(error)) {
                throw new ApiError("Failed to register", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isLoading: false });
        }
    },
    setUser: (user) => set({ user }),
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
