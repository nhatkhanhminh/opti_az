// components/DownlineNetworkTable.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ExternalLink, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
} from "lucide-react";
import { shortenWalletAddress } from "@/lib/shortAddress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { RainbowButton } from "./ui/rainbow-button";
import Link from "next/link";
import { formatUsdtAmount } from "@/lib/formatUsdt";
import { useTranslations } from 'next-intl';

interface DownlineUser {
  _id: string;
  address: string;
  referrer: string;
  totalInvestment: number | bigint;
  level: number;
  timeJoin: string;
  isActive?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DownlineNetworkProps {
  userAddress: string | undefined;
}

export default function DownlineNetworkTable({ userAddress }: DownlineNetworkProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("1");
  const [investmentFilter, setInvestmentFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timeJoin', desc: true }]);
  const [downlineData, setDownlineData] = useState<DownlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Copy địa chỉ ví
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Copied", {
      description: "Copied to clipboard"
    });
  };

  // Hiển thị trạng thái đầu tư
  const getInvestmentStatus = (amount: number | bigint) => {
    const value = typeof amount === 'bigint' ? Number(amount) : amount;
    return value > 0 ? "invested" : "not-invested";
  };

  // Create column definitions using TanStack Table
  const columnHelper = createColumnHelper<DownlineUser>();
  const columns = useMemo(() => [
    columnHelper.accessor('address', {
      header: () => (
        <div className="flex items-center cursor-pointer">
          {t('PartnerPage.downlineNetwork.table.walletAddress')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: info => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 hidden sm:flex">
            <AvatarFallback>{info.getValue().substring(info.getValue().length - 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <div className="font-medium">{shortenWalletAddress(info.getValue())}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 cursor-pointer text-muted-foreground" 
              onClick={() => copyAddress(info.getValue())}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('level', {
      header: t('PartnerPage.downlineNetwork.table.level'),
      cell: info => <Badge variant="outline">F{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('totalInvestment', {
      header: () => (
        <div className="flex items-center justify-end cursor-pointer">
          {t('PartnerPage.downlineNetwork.table.staked')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: info => (
        <div className="text-right">
          ${typeof info.getValue() === 'bigint' 
            ? formatUsdtAmount(info.getValue()) 
            : Number(info.getValue()).toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor(row => getInvestmentStatus(row.totalInvestment), {
      id: 'investmentStatus',
      header: t('PartnerPage.downlineNetwork.table.status'),
      cell: info => (
        <Badge 
          variant={info.getValue() === 'invested' ? "default" : "secondary"}
          className={info.getValue() === 'invested'
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
        >
          {info.getValue() === 'invested' 
            ? t('PartnerPage.downlineNetwork.filters.staked.staked') 
            : t('PartnerPage.downlineNetwork.filters.staked.notStaked')}
        </Badge>
      ),
    }),
    columnHelper.accessor('timeJoin', {
      header: t('PartnerPage.downlineNetwork.table.joinedAt'),
      cell: info => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString('en-GB');
      },
    }),
    columnHelper.accessor('address', {
      id: 'actions',
      header: () => <div className="text-right">{t('PartnerPage.downlineNetwork.table.actions')}</div>,
      cell: info => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`https://bscscan.com/address/${info.getValue()}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              BSCScan
            </Link>
          </Button>
        </div>
      ),
    }),
  ], []);

  // Setup TanStack table
  const table = useReactTable({
    data: downlineData,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Fetch dữ liệu từ API
  useEffect(() => {
    if (!userAddress) return;
    
    const fetchDownlines = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get sort information from the current sorting state
        const sortInfo = sorting.length > 0 
          ? { field: sorting[0].id, order: sorting[0].desc ? 'desc' : 'asc' }
          : { field: 'timeJoin', order: 'desc' };
        
        const queryParams = new URLSearchParams({
          userAddress,
          level: levelFilter,
          investmentStatus: investmentFilter,
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sort: sortInfo.field,
          order: sortInfo.order
        });
        
        const response = await fetch(`/api/ref/downline?${queryParams}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch downlines");
        }
        
        const result = await response.json();
        
        if (result.success) {
          setDownlineData(result.data);
          setPagination(result.pagination);
        } else {
          console.error("Unknown error")
          // throw new Error(result.error || "Unknown error");
        }
      } catch (error: any) {
        console.error("Error fetching downlines:", error);
        setError(error.message);
    
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownlines();
  }, [userAddress, levelFilter, investmentFilter, pagination.page, sorting]);

  // Xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('PartnerPage.downlineNetwork.title')}</CardTitle>
          <CardDescription>{t('PartnerPage.downlineNetwork.description')}</CardDescription>
        </div>
        <Link href="/referral-tree">
          <RainbowButton size="default">
            <span className="sm:hidden">{t('PartnerPage.downlineNetwork.table.viewNetwork')}</span>
            <span className="hidden sm:inline">{t('PartnerPage.downlineNetwork.table.viewTreeNetwork')}</span>
          </RainbowButton>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('PartnerPage.downlineNetwork.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('PartnerPage.downlineNetwork.filters.level.title')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('PartnerPage.downlineNetwork.filters.level.all')}</SelectItem>
                <SelectItem value="1">{t('PartnerPage.downlineNetwork.filters.level.direct')}</SelectItem>
                <SelectItem value="2">{t('PartnerPage.downlineNetwork.filters.level.f2')}</SelectItem>
                <SelectItem value="3">{t('PartnerPage.downlineNetwork.filters.level.f3')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={investmentFilter} onValueChange={setInvestmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('PartnerPage.downlineNetwork.filters.staked.title')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('PartnerPage.downlineNetwork.filters.staked.all')}</SelectItem>
                <SelectItem value="invested">{t('PartnerPage.downlineNetwork.filters.staked.staked')}</SelectItem>
                <SelectItem value="not-invested">{t('PartnerPage.downlineNetwork.filters.staked.notStaked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead 
                          key={header.id}
                          className={header.id === 'totalInvestment' ? 'text-right' : ''}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {Array(1).fill(null).map((_, index) => (
                    <TableRow key={index}>
                      {/* Wallet address column */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full hidden sm:flex" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </div>
                      </TableCell>
                      {/* Level column */}
                      <TableCell>
                        <Skeleton className="h-5 w-[40px]" />
                      </TableCell>
                      {/* Total Investment column */}
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-[80px] ml-auto" />
                      </TableCell>
                      {/* Status column */}
                      <TableCell>
                        <Skeleton className="h-5 w-[60px]" />
                      </TableCell>
                      {/* Joined at column */}
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      {/* Actions column */}
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-[80px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" /> 
              {t('PartnerPage.downlineNetwork.table.loading')}
            </div>
          </>
        ) : error ? (
          <div className="flex items-center justify-center p-6 text-red-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead 
                          key={header.id}
                          className={header.id === 'totalInvestment' ? 'text-right' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-8 w-8" />
                          <p>{t('PartnerPage.downlineNetwork.table.noData')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Phân trang */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('PartnerPage.downlineNetwork.table.pagination.previous')}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {t('PartnerPage.downlineNetwork.table.pagination.page', { current: pagination.page, total: pagination.pages })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  {t('PartnerPage.downlineNetwork.table.pagination.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              {t('PartnerPage.downlineNetwork.table.pagination.displaying', { 
                displayed: table.getFilteredRowModel().rows.length, 
                total: pagination.total 
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}