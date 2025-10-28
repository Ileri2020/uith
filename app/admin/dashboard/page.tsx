'use client'

// import * as React from 'react'
// import { useState, useEffect } from 'react'
// import { StatCards } from '@/components/dashboard/stat-cards'
// import { DepartmentAreaChart } from '@/components/dashboard/charts/department-area-chart'
// import { GenderDistributionChart } from '@/components/dashboard/charts/gender-distribution-chart'
// import { BarChartCard } from '@/components/dashboard/charts/bar-chart'
// import { RevenueOverTimeChart } from '@/components/dashboard/charts/revenue-over-time-chart'
// import { MedicineQuantityChart } from '@/components/dashboard/charts/medicine-quantity-chart'
// import { fetchData } from '@/lib/api'
// import { Skeleton } from '@/components/ui/skeleton'
// import { chartConfig } from './data' // Keep chart configuration for now

// // Define types for our data
// interface DashboardStats {
//   stats: Array<{
//     label: string
//     icon: string
//     value: string | number
//   }>
//   revenueByDept: any[]
//   visitsByDept: any[]
//   genderData: { name: string; value: number }[]
//   bloodTypeData: { type: string; count: number }[]
//   itemTypeData: { type: string; count: number }[]
//   medicineQuantityData: { name: string; quantity: number }[]
// }

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true)
//   const [dashboardData, setDashboardData] = useState<Partial<DashboardStats>>(
//     {},
//   )
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setLoading(true)
//       try {
//         // Fetch all required data
//         const statsResponse =
//           await fetchData<DashboardStats['stats']>('dashboard/stats')
//         const revenueByDeptResponse = await fetchData<
//           DashboardStats['revenueByDept']
//         >('dashboard/revenue-by-department')
//         const visitsByDeptResponse = await fetchData<
//           DashboardStats['visitsByDept']
//         >('dashboard/visits-by-department')
//         const genderDataResponse = await fetchData<
//           DashboardStats['genderData']
//         >('dashboard/gender-distribution')
//         const bloodTypeDataResponse = await fetchData<
//           DashboardStats['bloodTypeData']
//         >('dashboard/blood-type-distribution')
//         const itemTypeDataResponse = await fetchData<
//           DashboardStats['itemTypeData']
//         >('dashboard/item-type-count')
//         const medicineQuantityDataResponse = await fetchData<
//           DashboardStats['medicineQuantityData']
//         >('dashboard/medicine-quantity')

//         // Check if any request had an error
//         if (
//           statsResponse.error ||
//           revenueByDeptResponse.error ||
//           visitsByDeptResponse.error ||
//           genderDataResponse.error ||
//           bloodTypeDataResponse.error ||
//           itemTypeDataResponse.error ||
//           medicineQuantityDataResponse.error
//         ) {
//           throw new Error('Failed to load some dashboard data')
//         }

//         // Set all data
//         setDashboardData({
//           stats: statsResponse.data,
//           revenueByDept: revenueByDeptResponse.data,
//           visitsByDept: visitsByDeptResponse.data,
//           genderData: genderDataResponse.data,
//           bloodTypeData: bloodTypeDataResponse.data,
//           itemTypeData: itemTypeDataResponse.data,
//           medicineQuantityData: medicineQuantityDataResponse.data,
//         })
//         setError(null)
//       } catch (err) {
//         setError('Failed to load dashboard data')
//         console.error('Dashboard data fetch error:', err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [])

//   if (error) {
//     return (
//       <div className="p-6 text-center text-destructive">Error: {error}</div>
//     )
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {loading ? (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {Array(8)
//               .fill(0)
//               .map((_, i) => (
//                 <Skeleton key={i} className="h-[100px] w-full" />
//               ))}
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Skeleton className="h-[300px] w-full" />
//             <Skeleton className="h-[300px] w-full" />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {Array(5)
//               .fill(0)
//               .map((_, i) => (
//                 <Skeleton key={i} className="h-[300px] w-full" />
//               ))}
//           </div>
//         </div>
//       ) : (
//         <>
//           {dashboardData.stats && <StatCards data={dashboardData.stats} />}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {dashboardData.revenueByDept && (
//               <DepartmentAreaChart
//                 title="Revenue by Department"
//                 data={dashboardData.revenueByDept}
//                 config={chartConfig}
//               />
//             )}

//             {dashboardData.visitsByDept && (
//               <DepartmentAreaChart
//                 title="Visits by Department"
//                 data={dashboardData.visitsByDept}
//                 config={chartConfig}
//               />
//             )}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {dashboardData.genderData && (
//               <GenderDistributionChart data={dashboardData.genderData} />
//             )}

//             {dashboardData.bloodTypeData && (
//               <BarChartCard
//                 title="Blood Type Distribution"
//                 data={dashboardData.bloodTypeData}
//                 dataKey="count"
//                 categoryKey="type"
//                 color="hsl(var(--chart-2))"
//               />
//             )}

//             {dashboardData.itemTypeData && (
//               <BarChartCard
//                 title="Item Type Count"
//                 data={dashboardData.itemTypeData}
//                 dataKey="count"
//                 categoryKey="type"
//                 color="hsl(var(--chart-3))"
//               />
//             )}

//             {dashboardData.medicineQuantityData && (
//               <MedicineQuantityChart
//                 data={dashboardData.medicineQuantityData}
//               />
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }









import * as React from 'react';
import { useState, useEffect } from 'react';
import { StatCards } from '@/components/dashboard/stat-cards';
import { DepartmentAreaChart } from '@/components/dashboard/charts/department-area-chart';
import { GenderDistributionChart } from '@/components/dashboard/charts/gender-distribution-chart';
import { BarChartCard } from '@/components/dashboard/charts/bar-chart';
import { RevenueOverTimeChart } from '@/components/dashboard/charts/revenue-over-time-chart';
import { MedicineQuantityChart } from '@/components/dashboard/charts/medicine-quantity-chart';

const stats = [
  { label: "Total Users", icon: "Users", value: 1000 },
  { label: "Total Revenue", icon: "DollarSign", value: "$10,000" },
  { label: "Total Appointments", icon: "Calendar", value: 500 },
  { label: "Total Medicines", icon: "Pill", value: 200 }
];

const revenueByDept = [
  { date: "2024-01-01", sales: 100, marketing: 200 },
  { date: "2024-01-02", sales: 150, marketing: 250 },
  { date: "2024-01-03", sales: 200, marketing: 300 }
];

const visitsByDept = [
  { date: "2024-01-01", sales: 50, marketing: 100 },
  { date: "2024-01-02", sales: 75, marketing: 125 },
  { date: "2024-01-03", sales: 100, marketing: 150 }
];

const genderData = [
  { name: "Male", value: 500 },
  { name: "Female", value: 400 },
  { name: "Other", value: 100 }
];

const bloodTypeData = [
  { type: "A+", count: 100 },
  { type: "A-", count: 50 },
  { type: "B+", count: 75 },
  { type: "B-", count: 25 },
  { type: "AB+", count: 50 },
  { type: "AB-", count: 10 },
  { type: "O+", count: 150 },
  { type: "O-", count: 50 }
];

const itemTypeData = [
  { type: "Medicine", count: 500 },
  { type: "Equipment", count: 200 },
  { type: "Service", count: 300 }
];

const medicineQuantityData = [
  { name: "Medicine A", quantity: 100 },
  { name: "Medicine B", quantity: 200 },
  { name: "Medicine C", quantity: 300 },
  { name: "Medicine D", quantity: 400 },
  { name: "Medicine E", quantity: 500 }
];

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  marketing: { label: "Marketing", color: "hsl(var(--chart-2))" }
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats,
    revenueByDept,
    visitsByDept,
    genderData,
    bloodTypeData,
    itemTypeData,
    medicineQuantityData
  });

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        // loading skeleton
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[100px] w-full bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px] w-full bg-gray-200 rounded" />
            <div className="h-[300px] w-full bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-[300px] w-full bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <StatCards data={dashboardData.stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentAreaChart
              title="Revenue by Department"
              data={dashboardData.revenueByDept}
              config={chartConfig}
            />
            <DepartmentAreaChart
              title="Visits by Department"
              data={dashboardData.visitsByDept}
              config={chartConfig}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <GenderDistributionChart data={dashboardData.genderData} />
            <BarChartCard
              title="Blood Type Distribution"
              data={dashboardData.bloodTypeData}
              dataKey="count"
              categoryKey="type"
              color="hsl(var(--chart-2))"
            />
            <BarChartCard
              title="Item Type Count"
              data={dashboardData.itemTypeData}
              dataKey="count"
              categoryKey="type"
              color="hsl(var(--chart-3))"
            />
            <MedicineQuantityChart data={dashboardData.medicineQuantityData} />
            <RevenueOverTimeChart data={dataRevenueOverTimeChart} />
          </div>
        </>
      )}
    </div>
  );
}

const dataRevenueOverTimeChart = [
  { date: "2024-01-01", total: 1000 },
  { date: "2024-01-02", total: 1500 },
  { date: "2024-01-03", total: 2000 },
  { date: "2024-01-04", total: 2500 },
  { date: "2024-01-05", total: 3000 }
];
