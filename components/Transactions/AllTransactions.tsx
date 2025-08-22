"use client";
import { useEffect, useState } from "react";
import alchemy from "@/utils/alchemy";
import { TransactionResponse, BlockWithTransactions } from "alchemy-sdk";

export default function AllTransactions({
  startBlock,
  pageSize = 5,
}: {
  startBlock: number;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const start = startBlock - (page - 1) * pageSize;
      const blockNumbers = Array.from({ length: pageSize }, (_, i) => start - i).filter((n) => n >= 0);

      const blocks: (BlockWithTransactions | null)[] = await Promise.all(
        blockNumbers.map((num) => alchemy.core.getBlockWithTransactions(num).catch(() => null))
      );

      const txs = blocks
        .filter((b): b is BlockWithTransactions => !!b)
        .flatMap((b) => b.transactions);

      setTransactions(txs);
    };

    fetchTransactions();
  }, [page, startBlock, pageSize]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">All Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.hash} className="border-b py-2">
            {tx.hash.slice(0, 12)}... → {tx.to}
          </li>
        ))}
      </ul>

      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
