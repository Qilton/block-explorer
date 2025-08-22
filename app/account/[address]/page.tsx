"use client"
import React, { useEffect, useState } from 'react';
import { Copy, CheckCircle, ExternalLink, Activity, Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import alchemy from '@/utils/alchemy';
import { AssetTransfersCategory, AssetTransfersResult } from 'alchemy-sdk';
import { formatEther } from 'ethers';
import Link from 'next/link';

interface AddressDetailProps {
    address?: string;
}

interface Transaction extends AssetTransfersResult {
}

const AddressDetailPage = ({ address = '0x1234567890123456789012345678901234567890' }: AddressDetailProps) => {
    const [balance, setBalance] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [txs, setTxs] = useState<Transaction[]>([]);
    const [txsLoading, setTxsLoading] = useState(true);
    const [totalTransactions, setTotalTransactions] = useState<number | null>(null);
    const [lastActivity, setLastActivity] = useState<{time: string, block: string}>({time: '', block: ''});

    useEffect(() => {
        const fetchData = async () => {
            if (!address) return;
            
            setLoading(true);
            setTxsLoading(true);
            try {
                const [bal, outgoingTransfers, incomingTransfers] = await Promise.all([
                    alchemy.core.getBalance(address),
                    alchemy.core.getAssetTransfers({
                        fromBlock: "0x0",
                        fromAddress: address,
                        category: [
                            AssetTransfersCategory.EXTERNAL,
                            AssetTransfersCategory.ERC20,
                            AssetTransfersCategory.ERC721,
                            AssetTransfersCategory.ERC1155
                        ],
                        maxCount: 1000,
                    }),
                    alchemy.core.getAssetTransfers({
                        fromBlock: "0x0",
                        toAddress: address,
                        category: [
                            AssetTransfersCategory.EXTERNAL,
                            AssetTransfersCategory.ERC20,
                            AssetTransfersCategory.ERC721,
                            AssetTransfersCategory.ERC1155
                        ],
                        maxCount: 1000,
                    })
                ]);

                setBalance(formatEther(bal.toString()));
                
                const allTransfers = [
                    ...(outgoingTransfers.transfers || []),
                    ...(incomingTransfers.transfers || [])
                ].sort((a, b) => parseInt(b.blockNum || '0') - parseInt(a.blockNum || '0'));
                
                const recentTxs = allTransfers.slice(0, 20);
                setTxs(recentTxs);
                setTotalTransactions(allTransfers.length);
                
                if (allTransfers.length > 0) {
                    const latestTx = allTransfers[0];
                    setLastActivity({
                        time: 'Recent',
                        block: latestTx.blockNum || 'N/A'
                    });
                }
            } catch (error) {
                setBalance('Error');
                setTxs([]);
                setTotalTransactions(null);
            }
            setLoading(false);
            setTxsLoading(false);
        };
        fetchData();
    }, [address]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatAddress = (addr: string) => {
        if (!addr) return 'N/A';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };
    const getTransactionIcon = (tx: Transaction) => {
        return tx.to?.toLowerCase() === address.toLowerCase() ?
            <ArrowDownLeft className="w-4 h-4 text-green-500" /> :
            <ArrowUpRight className="w-4 h-4 text-red-500" />;
    };

    const getTransactionType = (tx: Transaction) => {
        return tx.to?.toLowerCase() === address.toLowerCase() ? 'Received' : 'Sent';
    };

    const formatValue = (tx: Transaction) => {
        if (tx.category === AssetTransfersCategory.ERC20 && tx.rawContract?.decimal) {
            const decimals = parseInt(tx.rawContract.decimal, 16);
            return `${(parseFloat((tx.value ?? '0').toString()) / Math.pow(10, decimals)).toFixed(4)} ${tx.asset || 'Tokens'}`;
        }
        return `${parseFloat((tx.value ?? '0').toString()).toFixed(4)} ${(tx.asset === 'Quest' || !tx.asset) ? 'ETH' : tx.asset}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Overview</h1>
                    <p className="text-gray-600">Detailed view of Ethereum address activity</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Ethereum Address</h2>
                                <p className="text-blue-100 text-sm">Mainnet</p>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-blue-100 text-sm mb-1">Address</p>
                                    <p className="font-mono text-lg break-all pr-4 text-black">{address}</p>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-green-800 font-medium">ETH Balance</span>
                                </div>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-green-200 rounded w-24 mb-1"></div>
                                        <div className="h-4 bg-green-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-2xl font-bold text-green-900">{Number(balance).toFixed(4)}</p>
                                        <p className="text-green-700 text-sm">ETH</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-blue-800 font-medium">Transactions</span>
                                </div>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-blue-200 rounded w-16 mb-1"></div>
                                        <div className="h-4 bg-blue-200 rounded w-20"></div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-2xl font-bold text-blue-900">{totalTransactions !== null ? totalTransactions : 'N/A'}</p>
                                        <p className="text-blue-700 text-sm">Total</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-purple-800 font-medium">Last Activity</span>
                                </div>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-purple-200 rounded w-20 mb-1"></div>
                                        <div className="h-4 bg-purple-200 rounded w-16"></div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-2xl font-bold text-purple-900">{lastActivity.time || 'N/A'}</p>
                                        <p className="text-purple-700 text-sm">Block #{lastActivity.block || 'N/A'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                                <p className="text-gray-500 text-sm">Latest transfers and interactions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {txsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>
                        ) : txs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                                <p className="text-gray-500">This address hasn't made any transactions yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {txs.map((tx, i) => (
                                    <div key={tx.hash + i} className="group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200 border border-gray-100 hover:border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    {getTransactionIcon(tx)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">{getTransactionType(tx)}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.category === AssetTransfersCategory.ERC20
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : tx.category === AssetTransfersCategory.ERC721
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {(tx.asset === 'Quest' || !tx.asset) ? 'ETH' : tx.asset}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <span>From:</span>
                                                        <code className="font-mono">{formatAddress(tx.from)}</code>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span>To:</span>
                                                        <code className="font-mono">{formatAddress(tx.to || 'Unknown')}</code>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {formatValue(tx)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Block #{tx.blockNum || 'Pending'}</p>
                                                    </div>
                                                    <Link 
                                                        href={`/transaction/${tx.hash}`}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4 text-blue-600 hover:text-blue-800 font-bold" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Hash:</span>
                                                <code className="font-mono bg-white px-2 py-1 rounded border">
                                                    {formatAddress(tx.hash)}
                                                </code>
                                                <Link 
                                                    href={`/transaction/${tx.hash}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View Transaction
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressDetailPage;