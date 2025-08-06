// hooks/useContracts.ts
import { useMemo } from 'react'
import { getContract } from 'thirdweb'
import { client } from '@/lib/client'
import { bsc } from 'thirdweb/chains'
import { DATASTAKING, CLAIM, STAKING, MEMBER, CLAIM_DEMO, DATA_DEMO, LUCKY_WHEEL, CLAIM_AZC, STAKE_AZC } from '@/Context/listaddress'

export function useStakingContract() {
    return useMemo(() => {
      return getContract({
        client,
        chain: bsc,
        address: STAKING,
      })
    }, [])
  }
export function useDataStakingContract() {
  return useMemo(() => {
    // console.log("Initializing staking contract");
    return getContract({
      client,
      chain: bsc,
      address: DATASTAKING,
    })
  }, [])
}
export function useStakeAZCContract() {
  return useMemo(() => {
    return getContract({
      client,
      chain: bsc,
      address: STAKE_AZC,
    })
  }, [])
}
export function useDataContractDemo() {
  return useMemo(() => {
    // console.log("Initializing staking contract");
    return getContract({
      client,
      chain: bsc,
      address: DATA_DEMO,
    })
  }, [])
}



export function useClaimContract() {
  return useMemo(() => {
    return getContract({
      client,
      chain: bsc, 
      address: CLAIM,
    })
  }, [])
}

export function useClaimContractAZC() {
  return useMemo(() => {
    return getContract({
      client,
      chain: bsc, 
      address: CLAIM_AZC,
    })
  }, [])
}
export function useClaimContractDemo() {
  return useMemo(() => {
    return getContract({
      client,
      chain: bsc, 
      address: CLAIM_DEMO,
    })
  }, [])
}
export function useMemberContract() {
    return useMemo(() => {
      return getContract({
        client,
        chain: bsc, 
        address: MEMBER,
      })
    }, [])
  }


export function useLuckyWheelContract() {
  return useMemo(() => {
    return getContract({
      client,
      chain: bsc,
      address: LUCKY_WHEEL,
    });
  }, []);
}
