"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { useWindowSize } from "@/hooks/use-window-size"
import type { ReferralNode, TreeNodeDatum } from "@/types/referral"
import { NodeInfoCard } from "@/components/node-info-card"
import { PlusCircle, MinusCircle } from "lucide-react"
import Spinner from "./Spiner"

const svgLinkStyle = `
  .custom-path-link {
    stroke: #666;
    stroke-width: 2;
  }
`;

// Dynamically import react-d3-tree to avoid SSR issues
const Tree = dynamic(() => import("react-d3-tree").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading tree visualization...</div>,
})

// Convert our data structure to the format expected by react-d3-tree
const formatDataForTree = (data: ReferralNode): TreeNodeDatum => {
  return {
    name: data.name,
    attributes: {
      wallet: data.wallet,
      fullAddress: data.fullAddress,
      level: data.level,
      totalInvestment: data.totalInvestment,
      f1Volume: data.f1Volume,
      totalVolume: data.totalVolume
    },
    children: data.children.map((child: ReferralNode) => formatDataForTree(child)),
    __collapsed: data.__collapsed,
  }
}

// Filter tree data based on search term and level filter
const filterTreeData = (data: ReferralNode, searchTerm: string, filterLevel: string | null): ReferralNode => {
  // If no filters are applied, return the original data
  if (!searchTerm && !filterLevel) return data

  // Helper function to check if a node or any of its descendants match the filters
  const nodeMatches = (node: ReferralNode): boolean => {
    // Check if the current node matches the search term
    const matchesSearch = !searchTerm || node.wallet.toLowerCase().includes(searchTerm.toLowerCase())

    // Check if the current node matches the level filter
    const matchesLevel = !filterLevel || node.level === filterLevel

    // If both filters are applied, the node must match both
    if (searchTerm && filterLevel) {
      return (matchesSearch && matchesLevel) || node.children.some((child: ReferralNode) => nodeMatches(child))
    }

    // If only one filter is applied, the node must match that filter
    return matchesSearch || matchesLevel || node.children.some((child: ReferralNode) => nodeMatches(child))
  }

  // If the node doesn't match and has no matching descendants, filter it out
  if (!nodeMatches(data)) {
    return { ...data, children: [] }
  }

  // Process children recursively
  return {
    ...data,
    children: data.children
      .map((child: ReferralNode) => filterTreeData(child, searchTerm, filterLevel))
      .filter(
        (child: ReferralNode) =>
          child.children.length > 0 ||
          ((!searchTerm || child.wallet.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!filterLevel || child.level === filterLevel)),
      ),
  }
}

interface ReferralTreeProps {
  data: ReferralNode
  searchTerm?: string
  filterLevel?: string | null
}

export function ReferralTree({ data, searchTerm = "", filterLevel = null }: ReferralTreeProps) {
  const [treeData, setTreeData] = useState<TreeNodeDatum | null>(null)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<TreeNodeDatum | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowSize() // Include height as well
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize and filter tree data when props change
  useEffect(() => {
    const filteredData = filterTreeData(data, searchTerm, filterLevel)
    setTreeData(formatDataForTree(filteredData))
  }, [data, searchTerm, filterLevel])

  // Center the tree when the component mounts or window resizes
  useEffect(() => {
    if (containerRef.current && treeData) {
      const dimensions = containerRef.current.getBoundingClientRect()
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      })
    }
  }, [width, height, treeData])

  // Custom node component
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const levelColors: Record<string, string> = {
      You: "oklch(0.852 0.199 91.936)", 
      F1: "oklch(0.897 0.196 126.665)", 
      F2: "oklch(0.792 0.209 151.711)", 
      F3: "oklch(0.81 0.117 11.638)", 
      F4: "oklch(0.777 0.152 181.912)", 
      F5: "oklch(0.789 0.154 211.53)", 
      F6: "oklch(0.746 0.16 232.661)", 
      F7: "oklch(0.673 0.182 276.935)", 
      F8: "oklch(0.702 0.183 293.541)", 
      F9: "oklch(0.714 0.203 305.504)", 
      F10: "oklch(0.74 0.238 322.16)",
      F11: "oklch(53.2% 0.157 131.589)",
      F12: "oklch(52.7% 0.154 150.069)",
      F13: "oklch(50.8% 0.118 165.612)",
      F14: "oklch(51.1% 0.096 186.391)", 
      F15: "oklch(45% 0.085 224.283)", 
    }

    const bgColor = levelColors[nodeDatum.attributes?.level] || "#737c88" // gray-600
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0
    const isCollapsed = nodeDatum.__collapsed

    // Format total investment
    const formatInvestment = (value: string | number | undefined) => {
      if (!value || value === '0') return "$0";
      
      // Convert to number if it's a string
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      
      // Rút gọn số lớn thành dạng viết tắt (K, M, B)
      if (numValue >= 1000000000) {
        // Triệu
        return `$${(numValue / 1000000).toFixed(2).replace(/\.0$/, '')}M`;
      } else if (numValue >= 1000) {
        // Nghìn
        return `$${(numValue / 1000).toFixed(2).replace(/\.0$/, '')}K`;
      } else {
        // Số nhỏ hơn 1000
        return `$${numValue.toFixed(0)}`;
      }
    }

    const investmentValue = formatInvestment(nodeDatum.attributes?.totalInvestment);
    const hasInvestment = nodeDatum.attributes?.totalInvestment && 
                         nodeDatum.attributes?.totalInvestment !== '0' && 
                         nodeDatum.attributes?.totalInvestment !== 0;

    const handleNodeClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedNode(nodeDatum)
    }

    const handleToggleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleNode()
    }

    return (
      <g onClick={handleNodeClick}>
        <rect
          x="-50"
          y="-25"
          width="100"
          height="50"
          rx="4"
          fill={bgColor}
          className={hasInvestment ? "stroke-green-700 stroke-3" : ""}
        />

        {/* Level text */}
        <text 
          textAnchor="middle" 
          fill="black" 
          fontSize="14" 
          fontWeight="bold" 
          dy="-10"
          stroke="black"
          strokeWidth="0.5"
          paintOrder="stroke"
        >
          {nodeDatum.attributes?.level}
        </text>

        {/* Wallet address */}
        <text 
          textAnchor="middle" 
          fill="black" 
          fontSize="11" 
          dy="5"
          stroke="black"
          strokeWidth="0.3"
          paintOrder="stroke"
        >
          {nodeDatum.attributes?.wallet}
        </text>

        {/* Total Investment */}
        <text 
          textAnchor="middle" 
          fill={hasInvestment ? "black" : "gray"} 
          fontSize="10"
          fontWeight={hasInvestment ? "bold" : "normal"}
          dy="20"
          stroke="black"
          strokeWidth="0.2"
          paintOrder="stroke"
        >
          {investmentValue}
        </text>

        {/* F1 & Total Volume for root node */}
        {(nodeDatum.attributes?.level === "You" || nodeDatum.attributes?.level === "F1") && (
          <foreignObject 
            width="90"
            height="30"
            x="-45"
            y="30"
          >
            <div className="text-[9px] font-semibold text-black flex justify-between px-1 bg-gray-400 rounded w-full">
              <span title="Direct Volume">DV: {formatInvestment(nodeDatum.attributes?.f1Volume)}</span>
              <span title="Team Volume">TV: {formatInvestment(nodeDatum.attributes?.totalVolume)}</span>
            </div>
          </foreignObject>
        )}

        {/* Expand/collapse button for nodes with children */}
        {hasChildren && (
          <foreignObject 
            width="20" 
            height="20" 
            x="50" 
            y="-10" 
            onClick={handleToggleClick}
          >
            <div className="flex items-center justify-center w-full h-full cursor-pointer">
              {isCollapsed ? 
                <PlusCircle className="w-5 h-5 text-white bg-gray-700 rounded-full" /> : 
                <MinusCircle className="w-5 h-5 text-white bg-gray-700 rounded-full" />
              }
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  // Return early to prevent SSR
  if (!isMounted) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  if (!treeData) {
    return <div>Loading...</div>
  }

  return (
    <div ref={containerRef} className="w-full h-[500px] relative">
      <style>{svgLinkStyle}</style>
      <Tree
        data={treeData}
        orientation="vertical"
        translate={translate}
        renderCustomNodeElement={renderCustomNode}
        nodeSize={{ x: 160, y: 100 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        enableLegacyTransitions={true}
        transitionDuration={800}
        pathClassFunc={() => "custom-path-link"}
        pathFunc="straight"
        collapsible={true}
        onNodeClick={(nodeData: any) => setSelectedNode(nodeData)}
      />

      {/* Node info card */}
      {selectedNode && <NodeInfoCard node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}

