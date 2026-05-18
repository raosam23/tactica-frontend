import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { CustomContentProps, useSnackbar } from "notistack";
import React from "react";
import { forwardRef } from "react";

const variantStyles: Record<string, { container: string; icon: React.ElementType; iconClass: string }> = {
    success: {
        container: "bg-card border-green-500/40 text-foreground",
        icon: CheckCircle2,
        iconClass: "text-green-500",
    },
    error: {
        container: "bg-card border-red-500/40 text-foreground",
        icon: AlertCircle,
        iconClass: "text-red-500",
    },
    warning: {
        container: "bg-card border-amber-500/40 text-foreground",
        icon: AlertTriangle,
        iconClass: "text-amber-500",
    },
    info: {
        container: "bg-card border-blue-500/40 text-foreground",
        icon: Info,
        iconClass: "text-blue-500",
    },
    default: {
        container: "bg-card border-border text-foreground",
        icon: Info,
        iconClass: "text-muted-foreground",
    },
};

export const Toast = forwardRef<HTMLDivElement, CustomContentProps>(({ id, message, variant }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const config = variantStyles[variant ?? "default"] ?? variantStyles.default;
    const Icon = config.icon;

    return (
        <div
            className={`pointer-events-auto flex w-fit mx-auto max-w-sm cursor-pointer items-center justify-center gap-3 rounded-xl border px-6 py-3 backdrop-blur-xl shadow-lg shadow-black/40 ${config.container}`}
            ref={ref}
            onClick={() => closeSnackbar(id)}
        >
            <Icon className={`h-5 w-5 shrink-0 ${config.iconClass}`} />
            <p className="text-sm font-medium leading-relaxed tracking-wide">{message}</p>
        </div>
    );
});

Toast.displayName = "Toast";
