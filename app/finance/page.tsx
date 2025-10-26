"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabaseApi } from '@/lib/supabaseApi'
import { FinanceSummary, PaymentDetails, MonthlyFeeGenerationResult } from '@/lib/types'
import { DollarSign, Calendar, TrendingUp, CheckCircle2, XCircle, Plus, CreditCard, Users } from 'lucide-react'

export default function FinancePage() {
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary[]>([])
  const [payments, setPayments] = useState<PaymentDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
  })
  const [generatingFees, setGeneratingFees] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchFinanceData()
  }, [selectedMonth])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      const [summaryData, paymentsData] = await Promise.all([
        supabaseApi.getFinanceSummary(selectedMonth),
        supabaseApi.getPayments(selectedMonth)
      ])

      setFinanceSummary(summaryData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyFees = async () => {
    setGeneratingFees(true)
    setMessage('')
    try {
      const result = await supabaseApi.generateMonthlyFees(selectedMonth)
      setMessage(`Successfully generated fees! Created ${result.payments_created} payment records and updated ${result.finance_records_updated} class summaries.`)
      await fetchFinanceData()
    } catch (error: any) {
      setMessage('Error generating monthly fees: ' + error.message)
    } finally {
      setGeneratingFees(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const markPayment = async (paymentId: string, status: 'paid' | 'unpaid') => {
    try {
      await supabaseApi.markPaymentStatus(paymentId, status)
      await fetchFinanceData()
    } catch (error: any) {
      console.error('Error updating payment:', error)
    }
  }

  const totalExpected = financeSummary.reduce((sum, item) => sum + item.total_expected, 0)
  const totalPaid = financeSummary.reduce((sum, item) => sum + item.total_paid, 0)
  const totalBalance = financeSummary.reduce((sum, item) => sum + item.balance, 0)
  const paidPayments = payments.filter(p => p.status === 'paid').length
  const unpaidPayments = payments.filter(p => p.status === 'unpaid').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading finance data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-500 mt-1">Monthly fee generation and payment tracking</p>
        </div>
      </div>

      {/* Month Selection & Actions */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Fee Management</CardTitle>
          <CardDescription>Generate monthly fees and track payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="month">Select Month</Label>
              <Input
                id="month"
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="e.g., October 2025"
              />
            </div>
            <Button 
              onClick={generateMonthlyFees} 
              disabled={generatingFees}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {generatingFees ? 'Generating...' : 'Generate Monthly Fees'}
            </Button>
          </div>
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Expected</CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalExpected.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              For {selectedMonth}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Paid</CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {paidPayments} payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Outstanding</CardTitle>
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {unpaidPayments} unpaid
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Collection Rate</CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Collection efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Summary by Class */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Finance Summary by Class - {selectedMonth}</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Payment status and collection overview for each class
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Class</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Expected</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Paid</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Outstanding</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Progress</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financeSummary.map((summary) => {
                  const percentage = summary.total_expected > 0 ? (summary.total_paid / summary.total_expected) * 100 : 0
                  return (
                    <TableRow key={summary.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-4 px-6 font-medium text-gray-900">
                        {summary.class?.name || 'Unknown Class'}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-gray-900">
                        ${summary.total_expected.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-green-600">
                        ${summary.total_paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-red-600">
                        ${summary.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          summary.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {summary.status === 'completed' ? '✓ Complete' : '⏳ Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {financeSummary.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No fees generated for {selectedMonth}
              </h3>
              <p className="text-gray-500 mb-4">
                Click "Generate Monthly Fees" to create payment records for all active students.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Payments */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Individual Payments - {selectedMonth}</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Track and manage individual student payments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Student</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Parent</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Class</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Amount</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Status</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="py-4 px-6">
                      <div className="font-medium text-gray-900">{payment.student_name}</div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.parent_name}</div>
                        <div className="text-xs text-gray-500">{payment.parent_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                        {payment.class_name}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex space-x-2">
                        {payment.status === 'unpaid' ? (
                          <Button
                            size="sm"
                            onClick={() => markPayment(payment.id, 'paid')}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPayment(payment.id, 'unpaid')}
                            className="text-xs border-gray-300"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Mark Unpaid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments found for {selectedMonth}
              </h3>
              <p className="text-gray-500 mb-4">
                Generate monthly fees first to see individual payment records.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Financial Insights</CardTitle>
            <CardDescription className="text-sm text-gray-500">Key metrics and analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Students with Payments</span>
              <span className="text-sm">
                {payments.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Payment Amount</span>
              <span className="text-sm">
                ${payments.length > 0 ? (payments.reduce((sum, p) => sum + p.amount, 0) / payments.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Payment Success Rate</span>
              <span className="text-sm">
                {payments.length > 0 ? ((paidPayments / payments.length) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Classes with Outstanding Fees</span>
              <span className="text-sm">
                {financeSummary.filter(s => s.balance > 0).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">System Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Current system statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Month</span>
              <span className="text-sm font-semibold">{selectedMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Classes Tracked</span>
              <span className="text-sm">{financeSummary.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed Classes</span>
              <span className="text-sm text-green-600">{financeSummary.filter(s => s.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Classes</span>
              <span className="text-sm text-yellow-600">{financeSummary.filter(s => s.status === 'pending').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-semibold">
                {totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : '0'}% Complete
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
