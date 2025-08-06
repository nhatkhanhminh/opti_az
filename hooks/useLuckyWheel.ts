'use client';

import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { useLuckyWheelContract } from './useContract';
import { AZC } from '@/Context/listaddress';
import { getContract } from 'thirdweb';
import { client } from '@/lib/client';
import { bsc } from 'thirdweb/chains';

// Types
export interface WheelSegment {
  multiplier: number;
  probability: number;
  active: boolean;
}

export interface SpinResult {
  user: string;
  betAmount: string;
  segmentIndex: number;
  multiplier: number;
  rewardAmount: string;
  timestamp: number;
  claimed: boolean;
  txHash: string;
}

export interface GameStats {
  totalSpins: number;
  totalBetAmount: string;
  totalRewards: string;
  totalBurned: string;
  poolBalance: string;
}

export interface GameConfig {
  minBet: string;
  maxBet: string;
  burnRate: number;
  gameActive: boolean;
  poolBalance: string;
}

export function useLuckyWheel() {
  const luckyWheelContract = useLuckyWheelContract();
  const azcContract = getContract({
    client,
    chain: bsc,
    address: AZC,
  });
  
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user AZC balance
  const getUserBalance = useCallback(async () => {
    if (!account) return '0';
    
    try {
      const balance = await readContract({
        contract: azcContract,
        method: 'function balanceOf(address) view returns (uint256)',
        params: [account.address]
      });
      
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }, [account, azcContract]);

  // Get game configuration
  const getGameConfig = useCallback(async (): Promise<GameConfig | null> => {
    try {
      const config = await readContract({
        contract: luckyWheelContract,
        method: 'function gameConfig() view returns (uint256 minBet, uint256 maxBet, uint256 burnRate, bool gameActive, uint256 poolBalance)',
        params: []
      });
      
      return {
        minBet: config[0].toString(),
        maxBet: config[1].toString(),
        burnRate: Number(config[2]),
        gameActive: config[3],
        poolBalance: config[4].toString()
      };
    } catch (error) {
      console.error('Error getting game config:', error);
      return null;
    }
  }, [luckyWheelContract]);

  // Get wheel segments
  const getWheelSegments = useCallback(async (): Promise<WheelSegment[]> => {
    try {
      const segments = await readContract({
        contract: luckyWheelContract,
        method: 'function getWheelSegments() view returns ((uint256 multiplier, uint256 probability, bool active)[8])',
        params: []
      });
      
      return segments.map((segment: any) => ({
        multiplier: Number(segment.multiplier) / 100, // Convert from scaled value
        probability: Number(segment.probability) / 100, // Convert from scaled value
        active: segment.active
      }));
    } catch (error) {
      console.error('Error getting wheel segments:', error);
      return [];
    }
  }, [luckyWheelContract]);

  // Get game statistics
  const getGameStats = useCallback(async (): Promise<GameStats | null> => {
    try {
      const stats = await readContract({
        contract: luckyWheelContract,
        method: 'function getGameStats() view returns (uint256 totalSpins, uint256 totalBetAmount, uint256 totalRewards, uint256 totalBurned, uint256 poolBalance)',
        params: []
      });
      
      return {
        totalSpins: Number(stats[0]),
        totalBetAmount: stats[1].toString(),
        totalRewards: stats[2].toString(),
        totalBurned: stats[3].toString(),
        poolBalance: stats[4].toString()
      };
    } catch (error) {
      console.error('Error getting game stats:', error);
      return null;
    }
  }, [luckyWheelContract]);

  // Get user spins with pagination
  const getUserSpins = useCallback(async (offset: number = 0, limit: number = 20) => {
    if (!account) return { spins: [], total: 0 };
    
    try {
      const result = await readContract({
        contract: luckyWheelContract,
        method: 'function getUserSpinsPaginated(address user, uint256 offset, uint256 limit) view returns (uint256[] memory, uint256)',
        params: [account.address, BigInt(offset), BigInt(limit)]
      });
      
      const spinIds = result[0];
      const total = Number(result[1]);
      
      // Get detailed spin results
      const spins = await Promise.all(
        spinIds.map(async (spinId: bigint) => {
          const spin = await readContract({
            contract: luckyWheelContract,
            method: 'function getSpinResult(uint256 spinId) view returns ((address user, uint256 betAmount, uint256 segmentIndex, uint256 multiplier, uint256 rewardAmount, uint256 timestamp, bool claimed, string txHash))',
            params: [spinId]
          });
          
          return {
            id: spinId.toString(),
            user: spin.user,
            betAmount: spin.betAmount.toString(),
            segmentIndex: Number(spin.segmentIndex),
            multiplier: Number(spin.multiplier) / 100,
            rewardAmount: spin.rewardAmount.toString(),
            timestamp: Number(spin.timestamp),
            claimed: spin.claimed,
            txHash: spin.txHash
          };
        })
      );
      
      return { spins, total };
    } catch (error) {
      console.error('Error getting user spins:', error);
      return { spins: [], total: 0 };
    }
  }, [account, luckyWheelContract]);

  // Check and approve AZC allowance
  const checkAndApproveAllowance = useCallback(async (amount: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    try {
      // Check current allowance
      const allowance = await readContract({
        contract: azcContract,
        method: 'function allowance(address owner, address spender) view returns (uint256)',
        params: [account.address, luckyWheelContract.address]
      });
      
      const requiredAmount = BigInt(amount);
      
      if (allowance < requiredAmount) {
        // Need to approve
        const approveTransaction = prepareContractCall({
          contract: azcContract,
          method: 'function approve(address spender, uint256 amount) returns (bool)',
          params: [luckyWheelContract.address, requiredAmount]
        });
        
        const approveTxResult = await sendTransaction({
          transaction: approveTransaction,
          account
        });
        
        return approveTxResult.transactionHash;
      }
      
      return null; // Already approved
    } catch (error) {
      console.error('Error checking/approving allowance:', error);
      throw error;
    }
  }, [account, azcContract, luckyWheelContract]);

  // Spin function
  const spin = useCallback(async (betAmount: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First check and approve allowance if needed
      await checkAndApproveAllowance(betAmount);
      
      // Prepare spin transaction
      const spinTransaction = prepareContractCall({
        contract: luckyWheelContract,
        method: 'function spin(uint256 betAmount, string txHash) returns (uint256)',
        params: [BigInt(betAmount), ''] // txHash will be filled by the transaction
      });
      
      // Send transaction
      const txResult = await sendTransaction({
        transaction: spinTransaction,
        account
      });
      
      return {
        success: true,
        txHash: txResult.transactionHash,
        spinId: null // Will be determined from events or contract call
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Spin failed';
      setError(errorMessage);
      console.error('Spin error:', error);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [account, luckyWheelContract, checkAndApproveAllowance]);

  // Claim reward function
  const claimReward = useCallback(async (spinId: string) => {
    if (!account) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const claimTransaction = prepareContractCall({
        contract: luckyWheelContract,
        method: 'function claimReward(uint256 spinId, string claimTxHash)',
        params: [BigInt(spinId), ''] // claimTxHash will be filled by transaction
      });
      
      const txResult = await sendTransaction({
        transaction: claimTransaction,
        account
      });
      
      return {
        success: true,
        txHash: txResult.transactionHash
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Claim failed';
      setError(errorMessage);
      console.error('Claim error:', error);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [account, luckyWheelContract]);

  // Get user statistics
  const getUserStats = useCallback(async () => {
    if (!account) return null;
    
    try {
      const [totalBet, totalWon] = await Promise.all([
        readContract({
          contract: luckyWheelContract,
          method: 'function userTotalBet(address) view returns (uint256)',
          params: [account.address]
        }),
        readContract({
          contract: luckyWheelContract,
          method: 'function userTotalWon(address) view returns (uint256)',
          params: [account.address]
        })
      ]);
      
      return {
        totalBet: totalBet.toString(),
        totalWon: totalWon.toString()
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }, [account, luckyWheelContract]);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    spin,
    claimReward,
    
    // Getters
    getUserBalance,
    getGameConfig,
    getWheelSegments,
    getGameStats,
    getUserSpins,
    getUserStats,
    
    // Utils
    isConnected: !!account
  };
} 