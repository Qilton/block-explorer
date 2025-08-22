"use client";
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, CheckCircle, XCircle, Loader2, ArrowRight, Clock, Fuel, Hash, DollarSign } from 'lucide-react';
import { formatEther } from 'ethers';
import alchemy from '@/utils/alchemy';

interface TxDetailProps {
  params: { transaction: string };
}

const TransactionDetailPage = ({ params }: TxDetailProps) => {
  const [tx, setTx] = useState<any>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const txHash = params?.transaction ;

  useEffect(() => {
    const fetchTx = async () => {
      setLoading(true);
      try {
        const [txData, txReceipt] = await Promise.all([
          alchemy.core.getTransaction(txHash),
          alchemy.core.getTransactionReceipt(txHash)
        ]);
        setTx(txData);
        setReceipt(txReceipt);
      } catch (error) {
        console.error('Failed to fetch transaction:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [txHash]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const truncateAddress = (address: string, start = 6, end = 4) => {
    if (!address) return 'N/A';
    return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Transaction</h2>
              <p className="text-gray-600">Fetching transaction details from the blockchain...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
              <p className="text-gray-600">Unable to load transaction details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const InfoRow = ({ 
    icon, 
    label, 
    value, 
    copyable = false, 
    badge = null, 
    fullValue = '' 
  }: { 
    icon: React.ReactNode;
    label: string;
    value: string;
    copyable?: boolean;
    badge?: React.ReactNode;
    fullValue?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="text-gray-500">{icon}</div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {badge && badge}
        <span className="text-gray-900 font-mono text-sm">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(fullValue || value, label)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            {copiedField === label ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Hash className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          </div>
          <p className="text-gray-600">Comprehensive view of blockchain transaction information</p>
        </div>

        {receipt && (
          <Card className="mb-6 border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {receipt.status === 1 ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      Transaction {receipt.status === 1 ? 'Successful' : 'Failed'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {receipt.status === 1 ? 'This transaction was executed successfully' : 'This transaction failed during execution'}
                    </p>
                  </div>
                </div>
                <Badge variant={receipt.status === 1 ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                  {receipt.status === 1 ? 'Success' : 'Failed'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-blue-600" />
                <span>Transaction Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Hash"
                  value={truncateAddress(tx.hash, 8, 8)}
                  fullValue={tx.hash}
                  copyable
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Block"
                  value={tx.blockNumber?.toString() || 'Pending'}
                />
                <InfoRow
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="Index"
                  value={tx.transactionIndex?.toString() || 'N/A'}
                />
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Nonce"
                  value={tx.nonce?.toString() || 'N/A'}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Transfer Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                <InfoRow
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="From"
                  value={truncateAddress(tx.from)}
                  fullValue={tx.from}
                  copyable
                />
                <InfoRow
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="To"
                  value={truncateAddress(tx.to)}
                  fullValue={tx.to}
                  copyable
                />
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Value"
                  value={`${parseFloat(formatEther(tx.value?.toString() || '0')).toFixed(4)} ETH`}
                />
                <InfoRow
                  icon={<Fuel className="h-4 w-4" />}
                  label="Gas Price"
                  value={tx.gasPrice ? `${parseFloat(formatEther(tx.gasPrice.toString())).toFixed(9)} ETH` : 'N/A'}
                />
              </div>
            </CardContent>
          </Card>

          {receipt && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center space-x-2">
                  <Fuel className="h-5 w-5 text-orange-600" />
                  <span>Gas Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-1">
                  <InfoRow
                    icon={<Fuel className="h-4 w-4" />}
                    label="Gas Used"
                    value={receipt.gasUsed?.toString() || 'N/A'}
                  />
                  <InfoRow
                    icon={<Fuel className="h-4 w-4" />}
                    label="Cumulative Gas"
                    value={receipt.cumulativeGasUsed?.toString() || 'N/A'}
                  />
                  {receipt.contractAddress && (
                    <InfoRow
                      icon={<Hash className="h-4 w-4" />}
                      label="Contract"
                      value={truncateAddress(receipt.contractAddress)}
                      fullValue={receipt.contractAddress}
                      copyable
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

         
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;