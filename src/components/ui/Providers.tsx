"use client";
import React from "react";
import { SnackbarProvider } from "notistack";
import { Toast } from "./Toast";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SnackbarProvider
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            Components={{ default: Toast, success: Toast, error: Toast, warning: Toast, info: Toast }}
            classes={{ containerRoot: "mb-20" }}
            hideIconVariant
            action={null}
        >
            {children}
        </SnackbarProvider>
    );
};

export default Providers;
