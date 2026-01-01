// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import PharmacyBanner from '@/components/pharmacy/pharmacy-banner'
import MedicineStockGrid from '@/components/pharmacy/medicine-stock-grid'
import LowStockSection from '@/components/pharmacy/low-stock-section'
import OutOfStockSection from '@/components/pharmacy/out-of-stock-section'
import DispenseButton from '@/components/pharmacy/dispense-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Package, AlertTriangle, Pill, BarChart3, Star, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import PrescriptionDispenser from '@/components/pharmacy/prescription-dispenser'
import { getGreeting } from '@/utils/greeting'

export default function PharmacyLanding() {
  const { user } = useAppContext()
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    outOfStock: 0,
    revenue: 12450
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const stockRes = await fetch('/api/dbhandler?model=stock') // Standardized
      const stock = await stockRes.json()
      setStockData(stock)

      setStats({
        totalMedicines: stock.length,
        lowStock: stock.filter(m => m.quantity <= m.min_stock_level && m.quantity > 0).length,
        outOfStock: stock.filter(m => m.quantity === 0).length,
        revenue: 12450
      })
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const lowStockMedicines = stockData.filter(m => m.quantity <= m.min_stock_level && m.quantity > 0);
  const outOfStockMedicines = stockData.filter(m => m.quantity === 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 container mx-auto">
      {/* Header */}
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, Pharmacist {user?.last_name || 'Professional'}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider">
              {user?.level || 'Senior Pharmacist'} • {user?.sub_profession || 'Inventory Manager'}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star className="h-4 w-4 fill-current" />
              <span>{user?.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Inventory Items" value={stats.totalMedicines} icon={<Pill className="h-6 w-6" />} color="bg-blue-500" />
        <StatsCard title="Low Stock" value={stats.lowStock} icon={<AlertTriangle className="h-6 w-6" />} color="bg-yellow-500" />
        <StatsCard title="Out of Stock" value={stats.outOfStock} icon={<Package className="h-6 w-6" />} color="bg-red-500" />
        <StatsCard title="Daily Revenue" value={`$${stats.revenue}`} icon={<TrendingUp className="h-6 w-6" />} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <PrescriptionDispenser />

          <Tabs defaultValue="in-stock" className="space-y-4">
            <TabsList className="bg-white p-1 rounded-xl shadow-sm border">
              <TabsTrigger value="in-stock" className="rounded-lg">All Inventory</TabsTrigger>
              <TabsTrigger value="low-stock" className="rounded-lg">Low Stock ({stats.lowStock})</TabsTrigger>
              <TabsTrigger value="out-of-stock" className="rounded-lg">Out of Stock ({stats.outOfStock})</TabsTrigger>
            </TabsList>

            <TabsContent value="in-stock">
              <MedicineStockGrid medicines={stockData} />
            </TabsContent>
            <TabsContent value="low-stock">
              <LowStockSection medicines={lowStockMedicines} />
            </TabsContent>
            <TabsContent value="out-of-stock">
              <OutOfStockSection medicines={outOfStockMedicines} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-none bg-indigo-900 text-white">
            <CardHeader>
              <CardTitle>Internal Comms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/10 rounded-lg text-sm italic">
                "Check expiry of Batch B-12 by end of day."
              </div>
              <div className="p-3 bg-white/10 rounded-lg text-sm italic">
                "New shipment arriving at 3 PM."
              </div>
            </CardContent>
          </Card>

          <PharmacyBanner />
          <DispenseButton onDispenseSuccess={fetchData} />
        </div>
      </div>
      <Toaster />
    </div>
  )
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{value}</h3>
          </div>
          <div className={`${color} p-4 rounded-2xl text-white shadow-inner group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
