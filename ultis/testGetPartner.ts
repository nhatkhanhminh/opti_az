import { MEMBER } from "@/Context/listaddress";
import { client } from "@/lib/client";

import { createThirdwebClient, getContract, getContractEvents } from "thirdweb";
import { bsc } from "thirdweb/chains";
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";


export async function fetchContractData(
    contractAddress: string,
    functionName: string,
    rpcUrl: string,
    chain: string,
    privateKey: string
  ): Promise<any | null> {
    try {
        const contract = getContract({
            client,
            chain: bsc,
            address: MEMBER,
            });
        const preparedEvent = prepareEvent({
            signature:
               "event MemberAdded(address indexed member, address indexed upline)",
          });

          const events = await getContractEvents({
            contract,
            events: [preparedEvent],
          });
      return events;
    } catch (error) {
      console.error("Error fetching data from contract:", error);
      return null;
    }
  }