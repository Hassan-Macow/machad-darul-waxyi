export interface Admin {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  created_at?: string
  updated_at?: string
}

export interface Parent {
  id: string
  name: string
  phone: string
  address?: string
  created_at?: string
}

export interface Class {
  id: string
  name: string
  description?: string
  created_at?: string
}

export interface Student {
  id: string
  name: string
  parent_id: string
  class_id: string
  fee: number
  discount: number
  status: 'active' | 'inactive'
  created_at?: string
  parent?: Parent
  class?: Class
}

export interface MonthlyIncome {
  class_name: string
  total_students: number
  total_fee: number
  total_discount: number
  net_income: number
}

export interface DashboardStats {
  total_students: number
  active_students: number
  inactive_students: number
  total_classes: number
  total_parents: number
  monthly_income: number
}

export interface Payment {
  id: string
  student_id: string
  month: string
  amount: number
  status: 'paid' | 'unpaid'
  payment_date?: string
  created_at?: string
  student?: Student
}

export interface PaymentDetails {
  id: string
  student_id: string
  month: string
  amount: number
  status: 'paid' | 'unpaid'
  payment_date?: string
  student_name: string
  student_fee: number
  student_discount: number
  class_name: string
  class_id: string
  parent_name: string
  parent_phone: string
}

export interface FinanceSummary {
  id: string
  class_id: string
  month: string
  total_expected: number
  total_paid: number
  balance: number
  status: 'pending' | 'completed'
  created_at?: string
  class?: Class
}

export interface MonthlyFeeGenerationResult {
  payments_created: number
  finance_records_updated: number
  month: string
}

export interface PaymentUpdateResult {
  success: boolean
  payment_id: string
  status: string
}

export interface StudentOutstandingBalance {
  student_id: string
  student_name: string
  parent_name: string
  parent_phone: string
  class_name: string
  total_outstanding: number
  unpaid_months: string[]
  current_month_status?: 'paid' | 'unpaid'
  current_month_payment_id?: string
}
