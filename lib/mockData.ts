import { Parent, Class, Student, DashboardStats, MonthlyIncome } from './types'

// Mock Parents Data
export const mockParents: Parent[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    phone: '+252-61-234-5678',
    address: 'Hodan District, Mogadishu',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Fatima Mohamed',
    phone: '+252-61-345-6789',
    address: 'Wadajir District, Mogadishu',
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    name: 'Omar Ali',
    phone: '+252-61-456-7890',
    address: 'Karan District, Mogadishu',
    created_at: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    name: 'Amina Abdi',
    phone: '+252-61-567-8901',
    address: 'Dharkenley District, Mogadishu',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    name: 'Hassan Ibrahim',
    phone: '+252-61-678-9012',
    address: 'Shangani District, Mogadishu',
    created_at: '2024-01-19T10:00:00Z'
  }
]

// Mock Classes Data
export const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Grade 1',
    description: 'First grade elementary students',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Grade 2',
    description: 'Second grade elementary students',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Grade 3',
    description: 'Third grade elementary students',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '4',
    name: 'Kindergarten',
    description: 'Pre-school kindergarten class',
    created_at: '2024-01-10T10:00:00Z'
  }
]

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Abdirahman Ahmed',
    parent_id: '1',
    class_id: '1',
    fee: 50,
    discount: 5,
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    parent: mockParents[0],
    class: mockClasses[0]
  },
  {
    id: '2',
    name: 'Maryam Fatima',
    parent_id: '2',
    class_id: '1',
    fee: 50,
    discount: 0,
    status: 'active',
    created_at: '2024-01-21T10:00:00Z',
    parent: mockParents[1],
    class: mockClasses[0]
  },
  {
    id: '3',
    name: 'Mohamed Omar',
    parent_id: '3',
    class_id: '2',
    fee: 55,
    discount: 10,
    status: 'active',
    created_at: '2024-01-22T10:00:00Z',
    parent: mockParents[2],
    class: mockClasses[1]
  },
  {
    id: '4',
    name: 'Halima Amina',
    parent_id: '4',
    class_id: '3',
    fee: 60,
    discount: 0,
    status: 'active',
    created_at: '2024-01-23T10:00:00Z',
    parent: mockParents[3],
    class: mockClasses[2]
  },
  {
    id: '5',
    name: 'Ibrahim Hassan',
    parent_id: '5',
    class_id: '4',
    fee: 45,
    discount: 5,
    status: 'active',
    created_at: '2024-01-24T10:00:00Z',
    parent: mockParents[4],
    class: mockClasses[3]
  },
  {
    id: '6',
    name: 'Khadija Ali',
    parent_id: '1',
    class_id: '2',
    fee: 55,
    discount: 0,
    status: 'inactive',
    created_at: '2024-01-25T10:00:00Z',
    parent: mockParents[0],
    class: mockClasses[1]
  },
  {
    id: '7',
    name: 'Yusuf Mohamed',
    parent_id: '2',
    class_id: '3',
    fee: 60,
    discount: 10,
    status: 'active',
    created_at: '2024-01-26T10:00:00Z',
    parent: mockParents[1],
    class: mockClasses[2]
  },
  {
    id: '8',
    name: 'Aisha Omar',
    parent_id: '3',
    class_id: '4',
    fee: 45,
    discount: 0,
    status: 'active',
    created_at: '2024-01-27T10:00:00Z',
    parent: mockParents[2],
    class: mockClasses[3]
  }
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  total_students: 8,
  active_students: 7,
  inactive_students: 1,
  total_classes: 4,
  total_parents: 5,
  monthly_income: 345 // Sum of (fee - discount) for active students
}

// Mock Monthly Income by Class
export const mockMonthlyIncome: MonthlyIncome[] = [
  {
    class_name: 'Grade 1',
    total_students: 2,
    total_fee: 100,
    total_discount: 5,
    net_income: 95
  },
  {
    class_name: 'Grade 2',
    total_students: 1,
    total_fee: 55,
    total_discount: 10,
    net_income: 45
  },
  {
    class_name: 'Grade 3',
    total_students: 2,
    total_fee: 120,
    total_discount: 10,
    net_income: 110
  },
  {
    class_name: 'Kindergarten',
    total_students: 2,
    total_fee: 90,
    total_discount: 5,
    net_income: 85
  }
]

// Helper function to simulate async data fetching
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API functions
export const mockApi = {
  // Parents
  getParents: async () => {
    await delay(300)
    return [...mockParents]
  },
  
  addParent: async (parent: Omit<Parent, 'id' | 'created_at'>) => {
    await delay(300)
    const newParent: Parent = {
      ...parent,
      id: String(Date.now()),
      created_at: new Date().toISOString()
    }
    mockParents.push(newParent)
    return newParent
  },
  
  updateParent: async (id: string, data: Partial<Parent>) => {
    await delay(300)
    const index = mockParents.findIndex(p => p.id === id)
    if (index !== -1) {
      mockParents[index] = { ...mockParents[index], ...data }
      return mockParents[index]
    }
    throw new Error('Parent not found')
  },
  
  deleteParent: async (id: string) => {
    await delay(300)
    const index = mockParents.findIndex(p => p.id === id)
    if (index !== -1) {
      mockParents.splice(index, 1)
      return true
    }
    return false
  },

  // Classes
  getClasses: async () => {
    await delay(300)
    return [...mockClasses]
  },
  
  addClass: async (classData: Omit<Class, 'id' | 'created_at'>) => {
    await delay(300)
    const newClass: Class = {
      ...classData,
      id: String(Date.now()),
      created_at: new Date().toISOString()
    }
    mockClasses.push(newClass)
    return newClass
  },
  
  updateClass: async (id: string, data: Partial<Class>) => {
    await delay(300)
    const index = mockClasses.findIndex(c => c.id === id)
    if (index !== -1) {
      mockClasses[index] = { ...mockClasses[index], ...data }
      return mockClasses[index]
    }
    throw new Error('Class not found')
  },
  
  deleteClass: async (id: string) => {
    await delay(300)
    const index = mockClasses.findIndex(c => c.id === id)
    if (index !== -1) {
      mockClasses.splice(index, 1)
      return true
    }
    return false
  },

  // Students
  getStudents: async () => {
    await delay(300)
    return mockStudents.map(student => ({
      ...student,
      parent: mockParents.find(p => p.id === student.parent_id),
      class: mockClasses.find(c => c.id === student.class_id)
    }))
  },
  
  addStudent: async (student: Omit<Student, 'id' | 'created_at' | 'parent' | 'class'>) => {
    await delay(300)
    const newStudent: Student = {
      ...student,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      parent: mockParents.find(p => p.id === student.parent_id),
      class: mockClasses.find(c => c.id === student.class_id)
    }
    mockStudents.push(newStudent)
    return newStudent
  },
  
  updateStudent: async (id: string, data: Partial<Student>) => {
    await delay(300)
    const index = mockStudents.findIndex(s => s.id === id)
    if (index !== -1) {
      mockStudents[index] = { 
        ...mockStudents[index], 
        ...data,
        parent: mockParents.find(p => p.id === (data.parent_id || mockStudents[index].parent_id)),
        class: mockClasses.find(c => c.id === (data.class_id || mockStudents[index].class_id))
      }
      return mockStudents[index]
    }
    throw new Error('Student not found')
  },
  
  deleteStudent: async (id: string) => {
    await delay(300)
    const index = mockStudents.findIndex(s => s.id === id)
    if (index !== -1) {
      mockStudents.splice(index, 1)
      return true
    }
    return false
  },

  // Dashboard
  getDashboardStats: async () => {
    await delay(300)
    const activeStudents = mockStudents.filter(s => s.status === 'active')
    const monthlyIncome = activeStudents.reduce((sum, s) => sum + (s.fee - s.discount), 0)
    
    return {
      total_students: mockStudents.length,
      active_students: activeStudents.length,
      inactive_students: mockStudents.filter(s => s.status === 'inactive').length,
      total_classes: mockClasses.length,
      total_parents: mockParents.length,
      monthly_income: monthlyIncome
    }
  },

  // Finance
  getMonthlyIncome: async () => {
    await delay(300)
    const incomeByClass: { [key: string]: MonthlyIncome } = {}
    
    mockClasses.forEach(cls => {
      incomeByClass[cls.id] = {
        class_name: cls.name,
        total_students: 0,
        total_fee: 0,
        total_discount: 0,
        net_income: 0
      }
    })
    
    mockStudents.filter(s => s.status === 'active').forEach(student => {
      if (student.class_id && incomeByClass[student.class_id]) {
        incomeByClass[student.class_id].total_students += 1
        incomeByClass[student.class_id].total_fee += student.fee
        incomeByClass[student.class_id].total_discount += student.discount
        incomeByClass[student.class_id].net_income += (student.fee - student.discount)
      }
    })
    
    return Object.values(incomeByClass).filter(item => item.total_students > 0)
  }
}
