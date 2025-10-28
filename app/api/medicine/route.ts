import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserRole } from '@/utils/get-role'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(req: NextRequest) {
  const userRole = await getUserRole()

  if (!userRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowedRoles = ['Doctor', 'Pharmacist', 'Admin']
  if (!allowedRoles.includes(userRole.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient role' },
      { status: 403 },
    )
  }

  // const { data, error } = await supabase.from('medicine_stock').select('*')

  // if (error) {
  //   return NextResponse.json({ error: error.message }, { status: 500 })
  // }

  return NextResponse.json([
    { id: 'M001', name: 'Paracetamol 500mg', quantity: 120, min_stock_level: 50 },
    { id: 'M002', name: 'Amoxicillin 250mg', quantity: 8, min_stock_level: 20 },
    { id: 'M003', name: 'Metoprolol 25mg', quantity: 0, min_stock_level: 15 },
    { id: 'M004', name: 'Omeprazole 20mg', quantity: 65, min_stock_level: 30 },
  ], { status: 200 })
}
