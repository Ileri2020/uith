
// StatCards

const stats = [
  {
    label: "Total Users",
    icon: "Users",
    value: 1000
  },
  {
    label: "Total Revenue",
    icon: "DollarSign",
    value: "$10,000"
  },
  {
    label: "Total Appointments",
    icon: "Calendar",
    value: 500
  },
  {
    label: "Total Medicines",
    icon: "Pill",
    value: 200
  }
];


// BarChartCard

const dataBarChartCard = [
  { month: "Jan", revenue: 1000 },
  { month: "Feb", revenue: 2000 },
  { month: "Mar", revenue: 3000 },
  { month: "Apr", revenue: 4000 },
  { month: "May", revenue: 5000 },
  { month: "Jun", revenue: 6000 }
];

const propsBarChartCard = {
  title: "Revenue by Month",
  data: 'data',//data,
  dataKey: "revenue",
  categoryKey: "month",
  color: "hsl(var(--chart-2))"
};


// DepartmentAreaChart

const dataDepartmentAreaChart = [
  { date: "2024-01-01", sales: 100, marketing: 200 },
  { date: "2024-01-02", sales: 150, marketing: 250 },
  { date: "2024-01-03", sales: 200, marketing: 300 }
];

const config = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  marketing: { label: "Marketing", color: "hsl(var(--chart-2))" }
};

const propsDepartmentAreaChart = {
  title: "Department Performance",
  data: 'data', //data,
  config: config
};


// GenderDistributionChart

const dataGenderDistributionChart = [
  { name: "Male", value: 500 },
  { name: "Female", value: 400 },
  { name: "Other", value: 100 }
];

const propsGenderDistributionChart = {
  data: 'data'//data
};


// MedicineQuantityChart

const dataMedicineQuantityChart = [
  { name: "Medicine A", quantity: 100 },
  { name: "Medicine B", quantity: 200 },
  { name: "Medicine C", quantity: 300 },
  { name: "Medicine D", quantity: 400 },
  { name: "Medicine E", quantity: 500 }
];

const propsMedicineQuantityChart = {
  data: 'data'//data
};


// RevenueOverTimeChart

const dataRevenueOverTimeChart = [
  { date: "2024-01-01", total: 1000 },
  { date: "2024-01-02", total: 1500 },
  { date: "2024-01-03", total: 2000 },
  { date: "2024-01-04", total: 2500 },
  { date: "2024-01-05", total: 3000 }
];

const propsRevenueOverTimeChart = {
  data: 'data' //data
};


