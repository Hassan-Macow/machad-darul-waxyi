"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabaseApi } from '@/lib/supabaseApi'
import { Class } from '@/lib/types'
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await supabaseApi.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingClass) {
        await supabaseApi.updateClass(editingClass.id, formData)
      } else {
        await supabaseApi.addClass(formData)
      }
      
      setFormData({ name: '', description: '' })
      setShowForm(false)
      setEditingClass(null)
      fetchClasses()
    } catch (error) {
      console.error('Error saving class:', error)
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description || ''
    })
    setShowForm(true)
  }

  const requestDelete = (classItem: Class) => {
    setPendingDelete(classItem)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await supabaseApi.deleteClass(pendingDelete.id)
      setConfirmOpen(false)
      setPendingDelete(null)
      fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classItem.description && classItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading classes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 mt-1">Manage class information and organization</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {editingClass ? 'Update class information' : 'Enter class details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grade 1, Kindergarten, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of the class"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingClass ? 'Update Class' : 'Add Class'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingClass(null)
                    setFormData({ name: '', description: '' })
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
              <CardTitle className="text-base font-semibold text-gray-900">All Classes</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Manage and view all classes
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search classes..."
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
                <TableHead className="font-medium text-gray-700 py-3 px-6">Class Name</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6">Description</TableHead>
                <TableHead className="font-medium text-gray-700 py-3 px-6 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((classItem) => (
                <TableRow key={classItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900">{classItem.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-700">{classItem.description || 'No description'}</TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(classItem)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestDelete(classItem)}
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
          
          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No classes found' : 'No classes created yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all classes.'
                  : 'Get started by creating your first class in the system.'
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
        title="Delete class?"
        description={pendingDelete ? `This will permanently delete ${pendingDelete.name} and remove all its students. This action cannot be undone.` : 'This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
