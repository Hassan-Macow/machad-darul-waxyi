"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabaseApi } from '@/lib/supabaseApi'
import { Parent } from '@/lib/types'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Parent | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchParents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchParents = async () => {
    try {
      const data = await supabaseApi.getParents()
      setParents(data)
    } catch (error) {
      console.error('Error fetching parents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submitting) return // Prevent double submission
    
    try {
      setSubmitting(true)
      if (editingParent) {
        await supabaseApi.updateParent(editingParent.id, formData)
      } else {
        await supabaseApi.addParent(formData)
      }
      
      setFormData({ name: '', phone: '', address: '' })
      setShowForm(false)
      setEditingParent(null)
      fetchParents()
    } catch (error) {
      console.error('Error saving parent:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent)
    setFormData({
      name: parent.name,
      phone: parent.phone,
      address: parent.address || ''
    })
    setShowForm(true)
  }

  const requestDelete = (parent: Parent) => {
    setPendingDelete(parent)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await supabaseApi.deleteParent(pendingDelete.id)
      setConfirmOpen(false)
      setPendingDelete(null)
      fetchParents()
    } catch (error) {
      console.error('Error deleting parent:', error)
    }
  }

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading parents...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-500 mt-1">Manage parent information and contact details</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              {editingParent ? 'Edit Parent' : 'Add New Parent'}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {editingParent ? 'Update parent information' : 'Enter parent details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    placeholder="Enter parent's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  placeholder="Enter address (optional)"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingParent ? 'Update Parent' : 'Add Parent')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingParent(null)
                    setFormData({ name: '', phone: '', address: '' })
                  }}
                  className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50"
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
              <CardTitle className="text-base font-semibold text-gray-900">All Parents</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Manage and view all registered parents
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parents..."
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
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Name</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Phone</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Address</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow key={parent.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {parent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{parent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-gray-700">{parent.phone}</TableCell>
                    <TableCell className="py-4 px-6 text-sm text-gray-700">{parent.address || 'N/A'}</TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(parent)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        onClick={() => requestDelete(parent)}
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
          
          {filteredParents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No parents found' : 'No parents registered yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all parents.'
                  : 'Get started by adding your first parent to the system.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Parent
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null) }}
        onConfirm={confirmDelete}
        title="Delete parent?"
        description={pendingDelete ? `This will permanently delete ${pendingDelete.name}. This action cannot be undone.` : 'This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
