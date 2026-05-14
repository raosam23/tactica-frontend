import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full">
            {/* TODO: <Sidebar /> */}
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    );
};

export default DashboardLayout;
