"use client"
import { Table, TableHeader, TableBody, TableCaption, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useEffect, useState } from 'react';
import { Clock, Hash, Activity, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import alchemy from '@/utils/alchemy';
import { usePaginatedBlocks } from '@/hooks/useBlock';
import { useRouter } from 'next/navigation';
const BlockTable = () => {
    const router = useRouter();
    const [startBlock, setStartBlock] = useState<number | null>(null);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    useEffect(() => {
        const fetchStartBlock = async () => {
            const latestBlock = await alchemy.core.getBlockNumber();
            setStartBlock(latestBlock);
        };
        fetchStartBlock();
    }, []);

    const blocks = usePaginatedBlocks(startBlock ?? 0, 1,10);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedHash(text);
            setTimeout(() => setCopiedHash(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatHash = (hash: string) => {
        if (!hash) return '';
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) return `${Math.floor(diff)} secs ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

    const LoadingSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        </TableRow>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            Latest Ethereum Blocks
                        </CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-600">
                            Live Data
                        </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                        Real-time Ethereum blockchain data showing the most recent blocks
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-4">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            Block
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            Block Hash
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Age
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                                        Txns
                                    </TableHead>
                               
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!blocks || blocks.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <LoadingSkeleton key={index} />
                                    ))
                                ) : (
                                    blocks.map((block, index) => (
                                        <TableRow 
                                            key={block.number} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 group"
                                        >
                                            <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400 py-4">
                                                <div  onClick={()=>router.push(`/block/${block.number}`)} className="flex items-center gap-2 cursor-pointer">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full animate-pulse ",
                                                        index === 0 ? "bg-green-500" : "bg-slate-400"
                                                    )} />
                                                    {block.number}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2 max-w-xs">
                                                                <code className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                                                    {formatHash(block.hash)}
                                                                </code>
                                                                <button
                                                                    onClick={() => copyToClipboard(block.hash)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                                                >
                                                                    <Copy className={cn(
                                                                        "h-3 w-3 transition-colors",
                                                                        copiedHash === block.hash ? "text-green-600" : "text-slate-500"
                                                                    )} />
                                                                </button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="font-mono text-xs">{block.hash}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                                                        {block.timestamp ? formatTimeAgo(block.timestamp) : 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                        {block.timestamp ? 
                                                            new Date(block.timestamp * 1000).toLocaleDateString() + ' ' + 
                                                            new Date(block.timestamp * 1000).toLocaleTimeString()
                                                        : ''}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge 
                                                    variant={block.transactions?.length > 100 ? "default" : "secondary"}
                                                    className="font-mono"
                                                >
                                                    {block.transactions?.length ?? 0}
                                                </Badge>
                                            </TableCell>
                                         
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default BlockTable;