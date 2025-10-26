"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseApi } from '@/lib/supabaseApi'
import { DashboardStats } from '@/lib/types'
import { Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const data = await supabaseApi.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading dashboard data</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here’s what’s happening today.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Students</CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_students}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.active_students} active • {stats.inactive_students} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Classes</CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_classes}</div>
            <p className="text-xs text-gray-500 mt-1">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Parents</CardTitle>
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_parents}</div>
            <p className="text-xs text-gray-500 mt-1">
              Registered parents
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Monthly Income</CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${stats.monthly_income.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              From active students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-gray-500">Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/students" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Add New Student</p>
                <p className="text-xs text-gray-500">Register a new student</p>
              </div>
            </a>
            <a href="/parents" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Add New Parent</p>
                <p className="text-xs text-gray-500">Register a new parent</p>
              </div>
            </a>
            <a href="/finance" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">View Finance Report</p>
                <p className="text-xs text-gray-500">Check monthly income</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">System Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Current system statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Active Students</span>
              <span className="text-base font-semibold text-gray-900">{stats.active_students}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Total Classes</span>
              <span className="text-base font-semibold text-gray-900">{stats.total_classes}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Total Parents</span>
              <span className="text-base font-semibold text-gray-900">{stats.total_parents}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Total Records</span>
              <span className="text-base font-semibold text-gray-900">
                {stats.total_students + stats.total_parents + stats.total_classes}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">System Status</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ● Online
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
