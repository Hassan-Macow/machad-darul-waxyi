'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Bell, Globe, Shield, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || ''
        })
        setFullName(user.user_metadata?.full_name || '')
        setPhone(user.user_metadata?.phone || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone
        }
      })
      
      if (error) throw error
      
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error updating password: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            
            <Button 
              onClick={updateProfile} 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </Card>

        {/* Password Settings */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              onClick={changePassword} 
              disabled={loading || !newPassword || !confirmPassword}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* System Preferences */}
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="so">Somali</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            
            <div>
              <Label>Theme</Label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}