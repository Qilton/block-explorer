"use client";
import { useEffect, useState } from "react";
import alchemy from "@/utils/alchemy";
import { BlockWithTransactions } from "alchemy-sdk";

export function usePaginatedBlocks(
  startBlock: number,
  page: number,
  pageSize: number = 10
) {
  const [blocks, setBlocks] = useState<BlockWithTransactions[]>([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      const start = startBlock - (page - 1) * pageSize;
      const blockNumbers = Array.from({ length: pageSize }, (_, i) => start - i).filter((n) => n >= 0);

      const blockData = await Promise.all(
        blockNumbers.map((num) =>
          alchemy.core.getBlockWithTransactions(num).catch(() => null)
        )
      );

      setBlocks(blockData.filter((b): b is BlockWithTransactions => !!b));
    };

    fetchBlocks();
  }, [startBlock, page, pageSize]);

  return blocks;
}
