import { getContract, readContract } from "thirdweb"
import { client } from "@/lib/client"
import { bsc } from "thirdweb/chains"

/**
 * Helper function to check ERC20 token allowance
 * @param userAddress - Address of the token owner
 * @param tokenAddress - Address of the ERC20 token contract
 * @param spenderAddress - Address of the spender (usually staking contract)
 * @returns Current allowance amount as BigInt
 */
export async function checkTokenAllowance(
  userAddress: string,
  tokenAddress: string,
  spenderAddress: string
): Promise<bigint> {
  try {
    const tokenContract = getContract({
      client,
      chain: bsc,
      address: tokenAddress,
    })

    const allowanceAmount = await readContract({
      contract: tokenContract,
      method: "function allowance(address owner, address spender) view returns (uint256)",
      params: [userAddress, spenderAddress],
    })

    return BigInt(allowanceAmount)
  } catch (error) {
    console.error("Error checking allowance:", error)
    return 0n
  }
}

/**
 * Helper function to check if current allowance is sufficient for a transaction
 * @param currentAllowance - Current allowance amount
 * @param requiredAmount - Required amount for the transaction
 * @returns Boolean indicating if allowance is sufficient
 */
export function isAllowanceSufficient(
  currentAllowance: bigint,
  requiredAmount: string
): boolean {
  if (!requiredAmount || isNaN(parseFloat(requiredAmount))) return false
  
  const amountInWei = BigInt(Math.floor(parseFloat(requiredAmount) * 1e18))
  return currentAllowance >= amountInWei
}

/**
 * Helper function to format allowance amount for display
 * @param allowance - Allowance amount in wei
 * @param decimals - Token decimals (default 18)
 * @returns Formatted string
 */
export function formatAllowance(allowance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const result = Number(allowance) / Number(divisor)
  
  if (result === 0) return "0"
  if (result >= Number.MAX_SAFE_INTEGER / 2) return "Unlimited"
  
  return result.toFixed(4)
}

/**
 * Constant for unlimited allowance (uint256.max)
 */
export const UNLIMITED_ALLOWANCE = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

/**
 * Helper to check if allowance is effectively unlimited
 * @param allowance - Current allowance
 * @returns Boolean indicating if allowance is unlimited
 */
export function isUnlimitedAllowance(allowance: bigint): boolean {
  // Consider allowance unlimited if it's more than half of max uint256
  return allowance >= UNLIMITED_ALLOWANCE / 2n
} 