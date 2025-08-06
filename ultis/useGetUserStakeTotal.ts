import { useReadContract } from "thirdweb/react";
import { ThirdwebContract } from "thirdweb";


export function useGetUserStakeTotal(contract: ThirdwebContract, userAddress: string) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method: "function users(address) view returns (uint256 totalStaked, uint256 totalMaxOut, uint256 totalEarned)",
    params: [userAddress],
  });

  return {
    data,
    isLoading,
    error,
  };
}