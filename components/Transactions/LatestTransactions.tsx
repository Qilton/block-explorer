"use client";
import { useEffect, useState } from "react";
import alchemy from "@/utils/alchemy";
import { TransactionResponse } from "alchemy-sdk";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatEther } from "ethers";
import { formatRelativeTime } from "@/lib/format-time";
import { ArrowUpRight, Copy, ExternalLink, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {useRouter} from "next/navigation";
import Link from "next/link";
// helper fn to shorten addresses
const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

type FormattedTransaction = TransactionResponse & {
  timestampFormatted: string;
};

export default function LatestTransactions({ limit = 10 }) {
    const router=useRouter();
    const [transactions, setTransactions] = useState<FormattedTransaction[] | null>(null);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatest = async () => {
            const block = await alchemy.core.getBlockWithTransactions("latest");

            const formattedTxs = block.transactions.map((tx) => ({
                ...tx,
                timestampFormatted: formatRelativeTime(block.timestamp),
            }));

            setTransactions(formattedTxs);
        };

        fetchLatest();
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedHash(text);
            setTimeout(() => setCopiedHash(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatValue = (value: string) => {
        const ethValue = parseFloat(formatEther(value));
        if (ethValue === 0) return "0 ETH";
        if (ethValue < 0.001) return "<0.001 ETH";
        return `${ethValue.toFixed(6)} ETH`;
    };

    const getTransactionType = (tx: FormattedTransaction) => {
        if (!tx.to) return { type: "Contract Creation", color: "bg-purple-100 text-purple-700 border-purple-300" };
        if (parseFloat(formatEther(tx.value.toString())) > 0) return { type: "Transfer", color: "bg-green-100 text-green-700 border-green-300" };
        return { type: "Contract Call", color: "bg-blue-100 text-blue-700 border-blue-300" };
    };

    const displayedTxs = transactions?.slice(0, limit);

    const LoadingSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-12 w-full" /></TableCell>
            <TableCell><Skeleton className="h-12 w-full" /></TableCell>
            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                                <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            Latest Transactions
                        </CardTitle>
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-600">
                            Live Data
                        </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                        Real-time Ethereum transactions from the latest block
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-4 w-1/3">
                                        Transaction Hash
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-1/3">
                                        From → To
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                        Value
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                        Type
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!transactions ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <LoadingSkeleton key={index} />
                                    ))
                                ) : displayedTxs?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedTxs?.map((tx, idx) => {
                                        const txType = getTransactionType(tx);
                                        return (
                                            <TableRow 
                                                key={tx.hash + idx} 
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 group"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                                                            {tx.hash.slice(0, 16)}...
                                                                        </code>
                                                                        <button
                                                                            onClick={() => copyToClipboard(tx.hash)}
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                                                        >
                                                                            <Copy className={cn(
                                                                                "h-3 w-3 transition-colors",
                                                                                copiedHash === tx.hash ? "text-green-600" : "text-slate-500"
                                                                            )} />
                                                                        </button>
                                                                        <button onClick={() => router.push(`/transaction/${tx.hash}`)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                                                            <ExternalLink className="h-3 w-3 text-slate-500" />
                                                                        </button>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-mono text-xs">{tx.hash}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {tx.timestampFormatted}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col gap-1 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">From:</span>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Link href={`/account/${tx.from}`}>
                                                                                <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                                                                    {shortenAddress(tx.from)}
                                                                                </code>
                                                                            </Link>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="font-mono text-xs">{tx.from}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">To:</span>
                                                                {tx.to ? (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Link href={`/account/${tx.to}`}>
                                                                                    <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                                                                        {shortenAddress(tx.to)}
                                                                                    </code>
                                                                                </Link>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p className="font-mono text-xs">{tx.to}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                                        Contract Creation
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className="font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                                                    >
                                                        {formatValue(tx.value.toString())}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn("text-xs", txType.color)}
                                                    >
                                                        {txType.type}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer with view all link */}
                    <div className="border-t bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-b-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {displayedTxs?.length ?? 0} of {transactions?.length ?? 0} transactions
                            </span>
                            <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                                View all transactions
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}