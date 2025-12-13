"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, LayoutGrid, QrCode, ChevronDown } from "lucide-react"
import Link from "next/link"

export function TablesFilterToolbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
      {/* Left - Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo số bàn, tên khu vực..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 sm:w-64"
          />
        </div>

        {/* Area Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Khu vực: {selectedArea}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setSelectedArea("All")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Tầng 1")}>Tầng 1</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Tầng 2")}>Tầng 2</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Khu ngoài trời")}>Khu ngoài trời</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Status: {selectedStatus}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setSelectedStatus("All")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Available")}>Available</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Occupied")}>Occupied</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Waiting for bill")}>Waiting for bill</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Needs cleaning")}>Needs cleaning</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Disabled")}>Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Link href="/admin/tables/layout">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-transparent" title="Layout view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/admin/tables/qr">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-transparent" title="QR manager">
            <QrCode className="h-4 w-4" />
          </Button>
        </Link>
        <Button className="h-10 gap-2 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add table</span>
        </Button>
      </div>
    </div>
  )
}
