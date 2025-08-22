"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      router.push(`/account/${trimmed}`);
    } else if (/^0x([A-Fa-f0-9]{64})$/.test(trimmed)) {
      router.push(`/transaction/${trimmed}`);
    } else if (/^\d+$/.test(trimmed)) {
      router.push(`/block/${trimmed}`);
    } else {
      alert("Not a valid address, tx hash, or block number");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl mx-auto my-6">
      <input
        type="text"
        className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none"
        placeholder="Search by address, tx hash, or block number"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
