import React, { createContext, useContext, useMemo, useState } from "react";

type DataRefreshState = {
    revision: number;
    notifyDataChanged: () => void;
};

const Ctx = createContext<DataRefreshState | null>(null);

export function DataRefreshProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [revision, setRevision] = useState(0);

    function notifyDataChanged() {
        setRevision((value) => value + 1);
    }

    const value = useMemo(
        () => ({
            revision,
            notifyDataChanged,
        }),
        [revision],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDataRefresh() {
    const value = useContext(Ctx);

    if (!value) {
        throw new Error("useDataRefresh must be used within DataRefreshProvider");
    }

    return value;
}