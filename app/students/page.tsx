"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabaseApi } from '@/lib/supabaseApi'
import { Student, Parent, Class } from '@/lib/types'
import { Plus, Search, Edit, Trash2, GraduationCap, ToggleLeft, ToggleRight } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    class_id: '',
    fee: 10,
    discount: 0,
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsData, parentsData, classesData] = await Promise.all([
        supabaseApi.getStudents(),
        supabaseApi.getParents(),
        supabaseApi.getClasses()
      ])

      setStudents(studentsData)
      setParents(parentsData)
      setClasses(classesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingStudent) {
        await supabaseApi.updateStudent(editingStudent.id, formData)
      } else {
        await supabaseApi.addStudent(formData)
      }
      
      setFormData({
        name: '',
        parent_id: '',
        class_id: '',
        fee: 10,
        discount: 0,
        status: 'active'
      })
      setShowForm(false)
      setEditingStudent(null)
      fetchData()
    } catch (error) {
      console.error('Error saving student:', error)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      parent_id: student.parent_id,
      class_id: student.class_id,
      fee: student.fee,
      discount: student.discount,
      status: student.status
    })
    setShowForm(true)
  }

  const requestDelete = (student: Student) => {
    setPendingDelete(student)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await supabaseApi.deleteStudent(pendingDelete.id)
      setConfirmOpen(false)
      setPendingDelete(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const toggleStatus = async (student: Student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    
    try {
      await supabaseApi.updateStudent(student.id, { status: newStatus })
      fetchData()
    } catch (error) {
      console.error('Error updating student status:', error)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.parent && student.parent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.class && student.class.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading students...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage student information, enrollment, and status</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {editingStudent ? 'Update student information' : 'Enter student details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parent_id">Parent</Label>
                  <select
                    id="parent_id"
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select a parent</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} - {parent.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class_id">Class</Label>
                  <select
                    id="class_id"
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee">Monthly Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStudent(null)
                    setFormData({
                      name: '',
                      parent_id: '',
                      class_id: '',
                      fee: 10,
                      discount: 0,
                      status: 'active'
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">All Students</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Manage and view all registered students
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-64 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="font-medium text-gray-700 py-3 px-6">Student</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6">Parent</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6">Class</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6">Fee</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6">Status</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {student.parent ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.parent.name}</div>
                        <div className="text-xs text-gray-500">{student.parent.phone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {student.class ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                        {student.class.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">${student.fee.toFixed(2)}</div>
                      {student.discount > 0 && (
                        <div className="text-xs text-blue-600">${student.discount.toFixed(2)} discount</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                      onClick={() => toggleStatus(student)}
                    >
                      ● {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(student)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestDelete(student)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No students found' : 'No students registered yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all students.'
                  : 'Get started by adding your first student to the system.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null) }}
        onConfirm={confirmDelete}
        title="Delete student?"
        description={pendingDelete ? `This will permanently delete ${pendingDelete.name}. This action cannot be undone.` : 'This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
