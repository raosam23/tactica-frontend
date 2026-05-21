"use client";
import "ldrs/react/LineWobble.css";
import "ldrs/react/Tailspin.css";
import "ldrs/react/LineSpinner.css";

import { LineSpinner, LineWobble, Tailspin } from "ldrs/react";

interface SpinnerProps {
    type: string;
    size?: string;
    speed?: string;
    color?: string;
}

export const Spinner = ({ type, size = "40", speed = "1.75", color = "white" }: SpinnerProps) => {
    switch (type) {
        case "tail-spin":
            return <Tailspin size={size} speed={speed} color={color} />;
        case "line-wobble":
            return <LineWobble size={size} speed={speed} color={color} />;
        case "line-spinner":
            return <LineSpinner size={size} speed={speed} color={color} />
        default:
            return <LineWobble size={size} speed={speed} color={color} />;
    }
};
