export interface ReferralNode {
    name: string
    wallet: string
    fullAddress?: string
    level: string
    totalInvestment?: string | number
    f1Volume?: string | number
    totalVolume?: string | number
    children: ReferralNode[]
    __collapsed?: boolean
  }
  
  export interface TreeNodeDatum {
    name: string
    attributes: {
      wallet: string
      fullAddress?: string
      level: string
      totalInvestment?: string | number
      f1Volume?: string | number
      totalVolume?: string | number
    }
    children: TreeNodeDatum[]
    __collapsed?: boolean
  }
  
  