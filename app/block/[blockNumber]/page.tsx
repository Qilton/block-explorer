"use client";
import React, { useEffect, useState } from "react";
import alchemy from "@/utils/alchemy";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  ExternalLink, 
  Clock, 
  Hash, 
  Fuel, 
  Zap, 
  User, 
  ArrowLeft,
  Activity,
  Database,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
interface BlockDetailProps {
  params: { blockNumber: string };
}

const BlockDetailPage = ({ params }: BlockDetailProps) => {
    const router=useRouter();
  const [block, setBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const blockNumber = Number(params.blockNumber);

  useEffect(() => {
    const fetchBlock = async () => {
      setLoading(true);
      try {
        const data = await alchemy.core.getBlockWithTransactions(blockNumber);
        setBlock(data);
      } catch (error) {
        console.error("Error fetching block:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [blockNumber]);

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

  const formatGasUsage = (gasUsed: any, gasLimit: any) => {
    if (!gasUsed || !gasLimit) return "N/A";
    const percentage = (Number(gasUsed) / Number(gasLimit)) * 100;
    return `${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
            <Database className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Block Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 text-center max-w-md">
            The requested block #{blockNumber} could not be found or does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1  className="text-3xl font-bold text-slate-900 dark:text-white cursor-pointer">
            Block #{block.number?.toLocaleString()}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            {formatTimeAgo(block.timestamp)} • {new Date(block.timestamp * 1000).toLocaleString()}
          </p>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Block Overview
            </CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600">
              Confirmed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem 
              icon={<Hash className="h-4 w-4" />}
              label="Block Hash" 
              value={block.hash} 
              mono 
              copyable
              onCopy={copyToClipboard}
              copied={copiedHash === block.hash}
            />
            <InfoItem 
              icon={<Hash className="h-4 w-4" />}
              label="Parent Hash" 
              value={block.parentHash} 
              mono 
              copyable
              onCopy={copyToClipboard}
              copied={copiedHash === block.parentHash}
            />
            <InfoItem 
              icon={<User className="h-4 w-4" />}
              label="Miner" 
              value={block.miner} 
              mono
              copyable
              onCopy={copyToClipboard}
              copied={copiedHash === block.miner}
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Timestamp" 
              value={new Date(block.timestamp * 1000).toLocaleString()}
            />
            <InfoItem 
              icon={<Fuel className="h-4 w-4" />}
              label="Gas Used" 
              value={
                <div className="flex items-center gap-2">
                  <span>{block.gasUsed?.toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatGasUsage(block.gasUsed, block.gasLimit)}
                  </Badge>
                </div>
              }
            />
            <InfoItem 
              icon={<TrendingUp className="h-4 w-4" />}
              label="Gas Limit" 
              value={block.gasLimit?.toLocaleString()}
            />
            <InfoItem 
              icon={<Zap className="h-4 w-4" />}
              label="Base Fee Per Gas" 
              value={
                block.baseFeePerGas
                  ? `${parseFloat(formatEther(block.baseFeePerGas.toString())).toFixed(9)} ETH`
                  : "N/A"
              }
            />
            <InfoItem 
              icon={<Activity className="h-4 w-4" />}
              label="Transactions" 
              value={
                <Badge variant="secondary" className="font-mono">
                  {block.transactions.length.toLocaleString()}
                </Badge>
              }
            />
            <InfoItem 
              icon={<Database className="h-4 w-4" />}
              label="Block Size" 
              value={`${(JSON.stringify(block).length / 1024).toFixed(2)} KB`}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              Transactions ({block.transactions.length.toLocaleString()})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {block.transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Transactions
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                This block contains no transactions.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {block.transactions.map((tx: any, index: number) => (
                  <div
                    key={tx.hash}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            #{index + 1}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <code  className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                    {formatHash(tx.hash)}
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
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                    <ExternalLink onClick={() => router.push(`/transaction/${tx.hash}`)} className="h-3 w-3 text-slate-500" />
                                  </button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{tx.hash}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">From:</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                    {formatHash(tx.from)}
                                  </code>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs">{tx.from}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">To:</span>
                            {tx.to ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                      {formatHash(tx.to)}
                                    </code>
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
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant="outline" 
                          className="font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                        >
                          {parseFloat(formatEther(tx.value.toString())).toFixed(6)} ETH
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Gas: {tx.gasLimit?.toString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockDetailPage;

const InfoItem = ({
  icon,
  label,
  value,
  mono = false,
  copyable = false,
  onCopy,
  copied = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: (text: string) => void;
  copied?: boolean;
}) => (
  <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2 group">
      <div
        className={cn(
          "text-sm font-medium text-slate-900 dark:text-white",
          mono && "font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs",
          copyable && "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        )}
        onClick={copyable && typeof value === 'string' ? () => onCopy?.(value) : undefined}
      >
        {typeof value === 'string' && value.length > 50 && mono ? 
          `${value.slice(0, 20)}...${value.slice(-20)}` : 
          value
        }
      </div>
      {copyable && typeof value === 'string' && onCopy && (
        <button
          onClick={() => onCopy(value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
        >
          <Copy className={cn(
            "h-3 w-3 transition-colors",
            copied ? "text-green-600" : "text-slate-500"
          )} />
        </button>
      )}
    </div>
  </div>
);