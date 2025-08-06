import { useReadContract } from "thirdweb/react";
import { ThirdwebContract } from "thirdweb";

// export function useGetF1Volume(contract: ThirdwebContract, userAddress: string) {
//   const { data, isLoading, error } = useReadContract({
//     contract: contract,
//     method: "function getF1Volume(address member) view returns (uint256)",
//     params: [userAddress as string],
//   });
//   return {
//     data,
//     isLoading,
//     error,
//   };
// }

export function useGetTeamVolume(contract: ThirdwebContract, userAddress: string) {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method: "function getTeamVolume(address member) view returns (uint256)",
    params: [userAddress as string],
  });
  return {
    data,
    isLoading,
    error,
  };
}

export function useGetUpline(contract: ThirdwebContract, userAddress: string) {
  const { data, isLoading, error} = useReadContract({
    contract: contract,
    method: "function getUpline(address member) view returns (address)",
    params: [userAddress as string],
  })
  return {
    data,
    isLoading,
    error,
  };
}
export function useGetDirectDownlines(contract: ThirdwebContract, userAddress: string) {
  const { data, isLoading, error} = useReadContract({
    contract: contract,
    method:
    "function getDirectDownlines(address member) view returns (address[])",
    params: [userAddress as string],
  })
  return {
    data,
    isLoading,
    error,
  };
}

export function useCalculateTotalCommission(contract: ThirdwebContract, userAddress: string) {
  const { data, isLoading, error} = useReadContract({
    contract: contract,
    method:
    "function calculateTotalCommission(address member) view returns (uint256)",
    params: [userAddress as string],
  })
  return {
    data,
    isLoading,
    error,
  };
}

