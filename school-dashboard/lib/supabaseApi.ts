import { supabase } from './supabase'
import { Admin, Parent, Class, Student, DashboardStats, MonthlyIncome, FinanceSummary, PaymentDetails, MonthlyFeeGenerationResult, PaymentUpdateResult } from './types'
import type { PostgrestError } from '@supabase/supabase-js'

// Helper function to simulate async behavior (optional)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Admin API
export const adminApi = {
  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) throw error
    return !!data
  },

  async getAdminByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      const e = error as PostgrestError
      if (e.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  async createAdmin(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .insert([admin])
      .select()
      .single()

    if (error) throw error
    return data as Admin
  }
}

// Parents API
export const parentsApi = {
  async getParents(): Promise<Parent[]> {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Parent[]
  },

  async addParent(parent: Omit<Parent, 'id' | 'created_at'>): Promise<Parent> {
    const { data, error } = await supabase
      .from('parents')
      .insert([parent])
      .select()
      .single()

    if (error) throw error
    return data as Parent
  },

  async updateParent(id: string, updates: Partial<Parent>): Promise<Parent> {
    const { data, error } = await supabase
      .from('parents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Parent
  },

  async deleteParent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('parents')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// Classes API
export const classesApi = {
  async getClasses(): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Class[]
  },

  async addClass(classData: Omit<Class, 'id' | 'created_at'>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single()

    if (error) throw error
    return data as Class
  },

  async updateClass(id: string, updates: Partial<Class>): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Class
  },

  async deleteClass(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// Students API
export const studentsApi = {
  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        parent:parents(*),
        class:classes(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Student[]
  },

  async addStudent(student: Omit<Student, 'id' | 'created_at' | 'parent' | 'class'>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select(`
        *,
        parent:parents(*),
        class:classes(*)
      `)
      .single()

    if (error) throw error
    return data as Student
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        parent:parents(*),
        class:classes(*)
      `)
      .single()

    if (error) throw error
    return data as Student
  },

  async deleteStudent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// Payments & Finance API
export const financeApi = {
  async generateMonthlyFees(month: string): Promise<MonthlyFeeGenerationResult> {
    const { data, error } = await supabase.rpc('generate_monthly_fees', { target_month: month })
    if (error) throw error
    return data as MonthlyFeeGenerationResult
  },

  async getPayments(month?: string): Promise<PaymentDetails[]> {
    let query = supabase.from('payment_details').select('*')
    if (month) query = query.eq('month', month)
    const { data, error } = await query
    if (error) throw error
    return (data || []) as PaymentDetails[]
  },

  async markPaymentStatus(paymentId: string, status: 'paid' | 'unpaid'): Promise<PaymentUpdateResult> {
    const { data, error } = await supabase.rpc('update_payment_status', { payment_id: paymentId, new_status: status })
    if (error) throw error
    return data as PaymentUpdateResult
  },

  async getFinanceSummary(month?: string): Promise<FinanceSummary[]> {
    let query = supabase.from('finance_summary').select('*, class:classes(*)')
    if (month) query = query.eq('month', month)
    const { data, error } = await query
    if (error) throw error
    return (data || []) as FinanceSummary[]
  }
}

// Dashboard API
export const dashboardApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats')

    if (error) throw error
    return data as DashboardStats
  },

  async getMonthlyIncome(): Promise<MonthlyIncome[]> {
    const { data, error } = await supabase
      .from('monthly_income_by_class')
      .select('*')

    if (error) throw error
    return (data || []) as MonthlyIncome[]
  }
}

// Combined API object (similar to mockApi structure)
export const supabaseApi = {
  // Admin
  isAdmin: adminApi.isAdmin,
  getAdminByEmail: adminApi.getAdminByEmail,
  createAdmin: adminApi.createAdmin,

  // Parents
  getParents: parentsApi.getParents,
  addParent: parentsApi.addParent,
  updateParent: parentsApi.updateParent,
  deleteParent: parentsApi.deleteParent,

  // Classes
  getClasses: classesApi.getClasses,
  addClass: classesApi.addClass,
  updateClass: classesApi.updateClass,
  deleteClass: classesApi.deleteClass,

  // Students
  getStudents: studentsApi.getStudents,
  addStudent: studentsApi.addStudent,
  updateStudent: studentsApi.updateStudent,
  deleteStudent: studentsApi.deleteStudent,

  // Dashboard
  getDashboardStats: dashboardApi.getDashboardStats,
  getMonthlyIncome: dashboardApi.getMonthlyIncome,

  // Finance
  generateMonthlyFees: financeApi.generateMonthlyFees,
  getPayments: financeApi.getPayments,
  markPaymentStatus: financeApi.markPaymentStatus,
  getFinanceSummary: financeApi.getFinanceSummary
}
