"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabaseApi } from '@/lib/supabaseApi'
import { FinanceSummary, PaymentDetails, MonthlyFeeGenerationResult, StudentOutstandingBalance } from '../../lib/types'
import { DollarSign, Calendar, TrendingUp, CheckCircle2, XCircle, Plus, CreditCard, Users, Search, Filter, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react'

export default function FinancePage() {
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary[]>([])
  const [payments, setPayments] = useState<PaymentDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
  })
  
  // Reports state
  const [allPayments, setAllPayments] = useState<PaymentDetails[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  
  // Outstanding balances state
  const [outstandingBalances, setOutstandingBalances] = useState<StudentOutstandingBalance[]>([])
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [generatingFees, setGeneratingFees] = useState(false)
  const [message, setMessage] = useState('')
  
  // Tab state - current month vs reports
  const [activeTab, setActiveTab] = useState<'current' | 'reports'>('current')
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchFinanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth])

  // Fetch all payments when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports' && allPayments.length === 0) {
      fetchAllPayments()
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      const [summaryData, paymentsData] = await Promise.all([
        supabaseApi.getFinanceSummary(selectedMonth),
        supabaseApi.getPayments(selectedMonth)
      ])

      setFinanceSummary(summaryData)
      setPayments(paymentsData)
      
      // Fetch outstanding balances
      await fetchOutstandingBalances()
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOutstandingBalances = async () => {
    try {
      setLoadingBalances(true)
      const balances = await supabaseApi.getStudentOutstandingBalances(selectedMonth)
      setOutstandingBalances(balances)
    } catch (error) {
      console.error('Error fetching outstanding balances:', error)
    } finally {
      setLoadingBalances(false)
    }
  }

  const fetchAllPayments = async () => {
    try {
      setLoadingReports(true)
      // Fetch all payments without month filter
      const data = await supabaseApi.getPayments()
      setAllPayments(data)
    } catch (error) {
      console.error('Error fetching all payments:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const generateMonthlyFees = async () => {
    // Check if fees already exist for this month
    if (payments.length > 0) {
      setMessage(`Fees for ${selectedMonth} have already been generated. To view existing payments, check the report below.`)
      return
    }

    setGeneratingFees(true)
    setMessage('')
    try {
      const result = await supabaseApi.generateMonthlyFees(selectedMonth)
      setMessage(`Successfully generated fees! Created ${result.payments_created} payment records and updated ${result.finance_records_updated} class summaries.`)
      await fetchFinanceData()
    } catch (error) {
      setMessage('Error generating monthly fees: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setGeneratingFees(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const markPayment = async (paymentId: string, status: 'paid' | 'unpaid') => {
    try {
      await supabaseApi.markPaymentStatus(paymentId, status)
      await fetchFinanceData()
      // Refresh outstanding balances
      await fetchOutstandingBalances()
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  // Filter payments based on search term, class, and payment status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.parent_phone.includes(searchTerm) ||
      payment.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClass = selectedClass === 'all' || payment.class_id === selectedClass
    
    const matchesStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter
    
    return matchesSearch && matchesClass && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedClass, paymentStatusFilter])

  // Get unique classes from payments for filter dropdown
  const uniqueClasses = Array.from(
    new Set(payments.map(p => p.class_id))
  ).map(id => {
    const payment = payments.find(p => p.class_id === id)
    return { id, name: payment?.class_name || 'Unknown' }
  })

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

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'current'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Current Month
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 font-semibold transition-colors relative ${
            activeTab === 'reports'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="inline-block h-4 w-4 mr-2" />
          Reports & History
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
      {/* Month Selection & Actions */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Monthly Fee Management</CardTitle>
              <CardDescription>Generate monthly fees and track payments</CardDescription>
            </div>
            {payments.length > 0 && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Generated</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="month">Current Month</Label>
              <Input
                id="month"
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="e.g., October 2025"
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Current month - see Reports tab for past months</p>
            </div>
            <Button 
              onClick={generateMonthlyFees} 
              disabled={generatingFees || payments.length > 0}
              className={payments.length > 0 ? "bg-gray-400 hover:bg-gray-500" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {payments.length > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Already Generated
                </>
              ) : generatingFees ? (
                'Generating...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Monthly Fees
                </>
              )}
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
                Click &quot;Generate Monthly Fees&quot; to create payment records for all active students.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outstanding Balances from Previous Months */}
      {outstandingBalances.length > 0 && (
        <Card className="bg-white border border-gray-200 rounded-xl border-orange-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Students with Outstanding Balances from Previous Months
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              These students have unpaid fees from previous months (including {selectedMonth})
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
                    <TableHead className="font-medium text-gray-700 py-3 px-6">Unpaid Months</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 px-6">Total Outstanding</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 px-6">{selectedMonth} Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingBalances.map((student) => (
                    <TableRow key={student.student_id} className="border-b border-gray-100 hover:bg-orange-50">
                      <TableCell className="py-4 px-6">
                        <div className="font-medium text-gray-900">{student.student_name}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.parent_name}</div>
                          <div className="text-xs text-gray-500">{student.parent_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          {student.class_name}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {student.unpaid_months.map((month, idx) => (
                            <span 
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                month === selectedMonth
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {month}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-lg font-bold text-orange-600">
                          ${student.total_outstanding.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {student.current_month_status === 'unpaid' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Unpaid in {selectedMonth}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Paid in {selectedMonth}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Payments */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Individual Payments - {selectedMonth}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Track and manage individual student payments
              </CardDescription>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student, parent, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative sm:w-48">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex h-10 w-full pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <option value="all">All Classes</option>
                    {uniqueClasses.map(classItem => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative sm:w-48">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="flex h-10 w-full pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
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
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Amount</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Status</TableHead>
                  <TableHead className="font-medium text-gray-700 py-3 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
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

          {/* Pagination Controls */}
          {filteredPayments.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-9 w-9"
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {filteredPayments.length === 0 && payments.length > 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments match your search
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filter criteria.
              </p>
            </div>
          )}

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
      </>
      ) : (
        <ReportsView payments={allPayments} loading={loadingReports} />
      )}
    </div>
  )
}

// Reports View Component
function ReportsView({ payments, loading }: { payments: PaymentDetails[], loading: boolean }) {
  const [groupedByMonth, setGroupedByMonth] = useState<{ [key: string]: PaymentDetails[] }>({})
  const [months, setMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [filteredPayments, setFilteredPayments] = useState<PaymentDetails[]>([])

  useEffect(() => {
    // Group payments by month
    const grouped: { [key: string]: PaymentDetails[] } = {}
    payments.forEach(payment => {
      if (!grouped[payment.month]) {
        grouped[payment.month] = []
      }
      grouped[payment.month].push(payment)
    })
    
    // Sort months descending
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
    
    setGroupedByMonth(grouped)
    setMonths(sortedMonths)
    
    // Set default selected month to most recent
    if (sortedMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(sortedMonths[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments])

  useEffect(() => {
    if (selectedMonth && groupedByMonth[selectedMonth]) {
      setFilteredPayments(groupedByMonth[selectedMonth])
    } else {
      setFilteredPayments([])
    }
  }, [selectedMonth, groupedByMonth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    )
  }

  const totalPayments = filteredPayments.length
  const paidCount = filteredPayments.filter(p => p.status === 'paid').length
  const unpaidCount = filteredPayments.filter(p => p.status === 'unpaid').length
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="bg-white border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select Month for Report</CardTitle>
          <CardDescription>Choose a month to view payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-12 w-full px-4 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <option value="">Select a month...</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            {selectedMonth && (
              <div className="text-sm text-gray-600">
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Records</CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalPayments}</div>
            <p className="text-xs text-gray-500 mt-1">All time payments</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Paid</CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{paidCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalPayments > 0 ? ((paidCount / totalPayments) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Unpaid</CardTitle>
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{unpaidCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalPayments > 0 ? ((unpaidCount / totalPayments) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-700">Total Collected</CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              of ${totalAmount.toFixed(2)} expected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report */}
      {selectedMonth && filteredPayments.length > 0 ? (
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">{selectedMonth} Report</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Detailed payment records for the selected month
                </CardDescription>
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
                    <TableHead className="font-medium text-gray-700 py-3 px-6">Amount</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 px-6">Status</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3 px-6">Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
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
                      <TableCell className="py-4 px-6 text-sm text-gray-500">
                        {payment.payment_date 
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : selectedMonth ? (
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payment records found for {selectedMonth}
            </h3>
            <p className="text-gray-500">
              No payments were generated for this month.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select a Month
            </h3>
            <p className="text-gray-500">
              Choose a month from the dropdown above to view payment details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
