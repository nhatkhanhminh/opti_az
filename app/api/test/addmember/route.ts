import { NextRequest, NextResponse } from "next/server";
import { MEMBER, STAKING } from "@/Context/listaddress";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { getContract, getContractEvents, prepareEvent } from "thirdweb";

function convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = convertBigIntToString(obj[key]);
      }
      return result;
    }
    
    return obj;
}

export async function GET(req: NextRequest) {
  try {
    let events;
    const contract = getContract({
      client,
      chain: bsc,
      address: STAKING,
    });
    console.log(contract);

    // "event UplineChanged(address indexed member, address indexed oldUpline, address indexed newUpline)",
    
    const preparedEvent = prepareEvent({
        signature:
        "event Staked(address indexed user, address indexed token, uint256 amount, uint256 usdtValue, uint256 planId)",
    });
    console.log(preparedEvent);

    events = await getContractEvents({
        contract,
      events: [preparedEvent],
    //   blockRange: 12n,
      fromBlock: BigInt(47304058n),
      toBlock: BigInt(47366317), 
    });

    console.log(events);
    const serializedEvents = convertBigIntToString(events);
    if (events) {
      return NextResponse.json({ data: serializedEvents , count: events.length}, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch data from contract" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
