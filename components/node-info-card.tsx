"use client"

import { X, ExternalLink, Copy, CheckCircle, DollarSign } from "lucide-react"
import { useState } from "react"
import type { TreeNodeDatum } from "@/types/referral"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface NodeInfoCardProps {
  node: TreeNodeDatum
  onClose: () => void
}

export function NodeInfoCard({ node, onClose }: NodeInfoCardProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('ReferralTreePage.nodeInfo')

  const handleCopyWallet = () => {
    const addressToCopy = node.attributes.fullAddress || node.attributes.wallet;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const formatWalletAddress = (address: string) => {
    if (!address) return "N/A";
    
    const cleanAddress = address.trim();
    
    if (cleanAddress.length > 16) {
      return `${cleanAddress.slice(0, 8)}...${cleanAddress.slice(-8)}`
    }
    return cleanAddress;
  }

  const getBscscanUrl = () => {
    const fullAddress = node.attributes.fullAddress || node.attributes.wallet;
    if (!fullAddress) return "#";
    
    const cleanAddress = fullAddress.trim();
    return `https://bscscan.com/address/${cleanAddress}`;
  }

  // Format total investment
  const formatInvestment = (value: string | number | undefined) => {
    if (!value || value === '0') return "$0";
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Format with commas and 2 decimal places if needed
    return '$' + numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  const hasInvestment = node.attributes.totalInvestment && 
                        node.attributes.totalInvestment !== '0' && 
                        node.attributes.totalInvestment !== 0;

  const hasF1Volume = node.attributes.f1Volume && 
                      node.attributes.f1Volume !== '0' && 
                      node.attributes.f1Volume !== 0;
                      
  const hasTotalVolume = node.attributes.totalVolume && 
                         node.attributes.totalVolume !== '0' && 
                         node.attributes.totalVolume !== 0;

  const levelColors: Record<string, string> = {
    You: "bg-yellow-400",
    F1: "bg-lime-300",
    F2: "bg-green-400",
    F3: "bg-rose-300",
    F4: "bg-teal-400",
    F5: "bg-cyan-400",
    F6: "bg-sky-400",
    F7: "bg-blue-400",
    F8: "bg-indigo-400",
    F9: "bg-violet-400",
    F10: "bg-purple-400",
    F11: "bg-lime-700",
    F12: "bg-green-700",
    F13: "bg-emerald-700",
    F14: "bg-teal-700",
    F15: "bg-cyan-700",
  }

  const bgColor = levelColors[node.attributes.level] || "bg-gray-400";

  return (
    <div className="absolute top-4 right-4 w-52 bg-card rounded-lg shadow-lg border overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <div className={`w-6 h-4 rounded ${bgColor} mr-2`}></div>
          <h3 className="font-medium">{node.name} </h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{t('level')}</p>
            <Badge variant="outline" className="mt-1">{node.attributes.level}</Badge>
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-1">{t('totalInvestment')}</p>
            <Badge variant={hasInvestment ? "default" : "secondary"} className={`mt-1 ${hasInvestment ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}`}>
              {formatInvestment(node.attributes.totalInvestment)}
            </Badge>
          </div>
        </div>
        
        {(node.attributes.level === "You" || node.attributes.level === "F1") && (
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Direct Volume</p>
              <Badge variant={hasF1Volume ? "default" : "secondary"} className={`mt-1 ${hasF1Volume ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""}`}>
                {formatInvestment(node.attributes.f1Volume)}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-1">Team Volume</p>
              <Badge variant={hasTotalVolume ? "default" : "secondary"} className={`mt-1 ${hasTotalVolume ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" : ""}`}>
                {formatInvestment(node.attributes.totalVolume)}
              </Badge>
            </div>
          </div>
        )}

        <div>
          {/* <p className="text-sm text-gray-400 mb-1">{t('walletAddress')}</p> */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium mr-2">{formatWalletAddress(node.attributes.wallet)}</p>
            <div className="flex items-center space-x-1">
              <Button
               variant="ghost" size="icon" className="cursor-pointer"
                onClick={handleCopyWallet}
               
                title="Copy wallet address"
              >
                {copied ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Link
                href={getBscscanUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
               
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <ExternalLink className="h-6 w-6" />
                  <span className="sr-only">BSCscan</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
