   export  const formatRelativeTime = (timestamp?: number) => {
        if (!timestamp) return "";
        const now = Date.now();
        const diff = Math.floor((now - timestamp * 1000) / 1000); // seconds
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(timestamp * 1000).toLocaleDateString();
    };