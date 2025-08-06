import { useReadContract } from "thirdweb/react";
import { ThirdwebContract } from "thirdweb";

export function useStakeInfo(contract: ThirdwebContract, stakeId: bigint) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method: "function getStakeInfo(uint256 stakeId) view returns (address user, address token, uint256 amount, uint256 usdtAmount, uint256 planId, uint256 startTime, bool active, uint256 totalClaimed, uint256 lastClaimTime)",
    params: [stakeId],
  });

  return {
    data,
    isLoading,
    error,
  };
}

export function useCanClaim(contract: ThirdwebContract, stakeId: bigint) {
  const { data, isLoading, error} = useReadContract({
    contract: contract,
    method:  "function canClaimStake(uint256 stakeId) view returns (bool)",
    params: [stakeId],
  });

  return {
    data,
    isLoading,
    error,
  };
}


export function getUserInfoStaked(contract: ThirdwebContract, address: string) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method:
    "function users(address) view returns (uint256 totalStaked, uint256 totalMaxOut, uint256 totalEarned)",
    params: [address],
  });

  return {
    data,
    isLoading,
    error,
  };
}

export function getUserStakes(contract: ThirdwebContract, address: string) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method:
      "function getUserStakes(address user) view returns ((uint256 id, address user, address token, uint256 amount, uint256 usdtAmount, uint256 planId, uint256 startTime, bool active, uint256 totalClaimed, uint256 lastClaimTime)[])",
    params: [address],
  });

  return {
    data,
    isLoading,
    error,
  };
}

export function getStakeDemo(contract: ThirdwebContract, address: string) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method:
      "function stakes(address user) view returns ((uint256 id, address user, address token, uint256 amount, uint256 usdtAmount, uint256 planId, uint256 startTime, bool active, uint256 totalClaimed, uint256 lastClaimTime)[])",
    params: [address],
  });

  return {
    data,
    isLoading,
    error,
  };
}


