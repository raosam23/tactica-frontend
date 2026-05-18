import { isAxiosError } from "axios";

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }

    static fromError(error: unknown): ApiError {
        if (error instanceof ApiError) return error;
        if (isAxiosError(error)) {
            let message = "An error occurred";
            const detail = error.response?.data?.detail;

            if (Array.isArray(detail)) {
                message = detail.map((d: { msg?: string }) => d.msg || "Invalid value").join(", ");
            } else if (typeof detail === "string") {
                message = detail;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }
            return new ApiError(message, error.response?.status, detail);
        }
        if (error instanceof Error) {
            return new ApiError(error.message);
        }
        return new ApiError("An unknown error occurred");
    }
}