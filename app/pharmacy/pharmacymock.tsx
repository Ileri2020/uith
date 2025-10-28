export interface Medicine {
  medicine_id: string
  name: string
  category: string
  description: string
  unit: string
  quantity: number
  min_stock_level: number
  supplier: string
  expiry_date: string
  updated_at: string
}

export interface Record {
  record_id: string
  symptoms: string
  patient_status: string
  visit_date: string
  visit_status: string
  patients: {
    users: {
      first_name: string
      last_name: string
    }
  }
}

export const mockMedicines: Medicine[] = [
  {
    medicine_id: '1',
    name: 'Paracetamol',
    category: 'Analgesic',
    description: 'Used to treat mild to moderate pain and fever.',
    unit: 'tablet',
    quantity: 0,
    min_stock_level: 10,
    supplier: 'MediPharm Inc.',
    expiry_date: '2025-12-31',
    updated_at: '2025-10-20T10:00:00Z',
  },
  {
    medicine_id: '2',
    name: 'Amoxicillin',
    category: 'Antibiotic',
    description: 'Used to treat bacterial infections.',
    unit: 'capsule',
    quantity: 1,
    min_stock_level: 5,
    supplier: 'HealthCare Supplies Ltd.',
    expiry_date: '2026-01-15',
    updated_at: '2025-10-22T09:30:00Z',
  },
  {
    medicine_id: '3',
    name: 'Loratadine',
    category: 'Antihistamine',
    description: 'Relieves allergy symptoms like sneezing and runny nose.',
    unit: 'tablet',
    quantity: 3,
    min_stock_level: 8,
    supplier: 'AllerCare Co.',
    expiry_date: '2026-03-10',
    updated_at: '2025-10-18T14:20:00Z',
  },
  {
    medicine_id: '4',
    name: 'Omeprazole',
    category: 'Antacid',
    description: 'Reduces stomach acid production.',
    unit: 'capsule',
    quantity: 25,
    min_stock_level: 10,
    supplier: 'GutWell Pharma',
    expiry_date: '2026-06-20',
    updated_at: '2025-10-24T11:15:00Z',
  },
  {
    medicine_id: '5',
    name: 'Metformin',
    category: 'Antidiabetic',
    description: 'Used to control blood sugar in type 2 diabetes.',
    unit: 'tablet',
    quantity: 40,
    min_stock_level: 15,
    supplier: 'Diabetix Labs',
    expiry_date: '2026-02-28',
    updated_at: '2025-10-25T08:45:00Z',
  },
  {
    medicine_id: '6',
    name: 'Atorvastatin',
    category: 'Lipid-lowering',
    description: 'Lowers cholesterol and triglycerides in the blood.',
    unit: 'tablet',
    quantity: 0,
    min_stock_level: 12,
    supplier: 'CardioHealth Ltd.',
    expiry_date: '2025-11-30',
    updated_at: '2025-10-10T16:00:00Z',
  },
  {
    medicine_id: '7',
    name: 'Ibuprofen',
    category: 'NSAID',
    description: 'Relieves pain, inflammation, and fever.',
    unit: 'tablet',
    quantity: 8,
    min_stock_level: 10,
    supplier: 'PainRelief Co.',
    expiry_date: '2026-04-05',
    updated_at: '2025-10-23T13:10:00Z',
  },
]

export const mockRecords: Record[] = [
  {
    record_id: '101',
    symptoms: 'Fever, cough, fatigue',
    patient_status: 'Outpatient',
    visit_date: '2025-10-20T09:00:00Z',
    visit_status: 'Completed',
    patients: {
      users: {
        first_name: 'John',
        last_name: 'Doe',
      },
    },
  },
  {
    record_id: '102',
    symptoms: 'Headache, dizziness',
    patient_status: 'Inpatient',
    visit_date: '2025-10-25T14:00:00Z',
    visit_status: 'Scheduled',
    patients: {
      users: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
    },
  },
]









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
import { Loader2, Package, AlertTriangle, Pill, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
// Import mock data
import { mockMedicines, mockRecords, Medicine } from '@/lib/mock-pharmacy-data'

export default function PharmacyLanding() {
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [outOfStockMedicines, setOutOfStockMedicines] = useState<Medicine[]>([])
  const [highStockMedicines, setHighStockMedicines] = useState<Medicine[]>([])
  const [stockData, setStockData] = useState<Medicine[]>(mockMedicines)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringThisMonth: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    try {
      const stock = mockMedicines

      const outOfStockData = stock.filter((medicine) => medicine.quantity === 0)

      const lowStockData = stock.filter(
        (medicine) =>
          medicine.quantity <= medicine.min_stock_level &&
          medicine.quantity > 0,
      )

      const highStockData = stock.filter(
        (medicine) =>
          medicine.quantity > medicine.min_stock_level,
      )

      const outOfStockCount = outOfStockData.length

      // Calculate medicines expiring this month
      const today = new Date()
      const nextMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      )
      const expiringCount = stock.filter((medicine) => {
        const expiryDate = new Date(medicine.expiry_date)
        return expiryDate > today && expiryDate <= nextMonth
      }).length

      setOutOfStockMedicines(outOfStockData)
      setLowStockMedicines(lowStockData)
      setHighStockMedicines(highStockData)

      setStats({
        totalMedicines: stock.length,
        lowStock: lowStockData.length,
        outOfStock: outOfStockCount,
        expiringThisMonth: expiringCount,
      })
    } catch (err: any) {
      toast.error(`Error fetching data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (
    medicineId: number,
    newQuantity: number,
  ) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local mock data
      const updated = stockData.map((med) =>
        parseInt(med.medicine_id) === medicineId
          ? { ...med, quantity: newQuantity }
          : med,
      )
      setStockData(updated)
      toast.success('Stock updated successfully!')
      fetchData() // Re-categorize
    } catch (err: any) {
      toast.error(`Error updating quantity: ${err.message}`)
    }
  }

  const handleRestockClick = (medicine: Medicine) => {
    const newQuantity = 10 // Default restock amount
    handleUpdateQuantity(parseInt(medicine.medicine_id), newQuantity)
  }

  return (
    <div className="min-h-screen">
      <PharmacyBanner />

      <main className="container p-4 md:p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Medicines
              </CardTitle>
              <Pill className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalMedicines}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.lowStock}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {stats.outOfStock}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Expiring This Month
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold text-purple-600">
                  {stats.expiringThisMonth}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in-stock" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock" className="relative">
                Low Stock
                {stats.lowStock > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white rounded-full text-[10px] flex items-center justify-center">
                    {stats.lowStock}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="out-of-stock" className="relative">
                Out of Stock
                {stats.outOfStock > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                    {stats.outOfStock}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Medicines</TabsTrigger>
            </TabsList>

            {/* Pass mock records to DispenseButton if needed */}
            <DispenseButton onDispenseSuccess={fetchData} />
          </div>

          <TabsContent value="in-stock" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>In-Stock Medicines</CardTitle>
                <CardDescription>
                  Medicines with adequate stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading medicines...</span>
                  </div>
                ) : (
                  <MedicineStockGrid medicines={highStockMedicines} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading low stock items...</span>
              </div>
            ) : (
              <LowStockSection
                medicines={lowStockMedicines}
                handleUpdateQuantity={handleUpdateQuantity}
              />
            )}
          </TabsContent>

          <TabsContent value="out-of-stock" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading out of stock items...</span>
              </div>
            ) : (
              <OutOfStockSection
                medicines={outOfStockMedicines}
                onRestock={handleRestockClick}
              />
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Medicines</CardTitle>
                <CardDescription>
                  Complete inventory of all medicines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading medicines...</span>
                  </div>
                ) : (
                  <MedicineStockGrid medicines={stockData} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Show urgent sections on main page regardless of tab */}
        {outOfStockMedicines.length > 0 && (
          <div className="pt-2">
            <OutOfStockSection
              medicines={outOfStockMedicines}
              onRestock={handleRestockClick}
            />
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}


