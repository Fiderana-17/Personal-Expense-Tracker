import React, { useState } from 'react';
import { User as UserIcon, Mail, Calendar, Save, AlertCircle, EyeOff, Eye, Database, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { changePassword } from '@/api/auth';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const totalExpenses = user?.expenses.length;
  const totalIncomes = user?.incomes.length;
  const totalCategories = user?.categories.length;

  const handleSave = async () => {
    if (!token) {
      setNotificationType('error');
      setNotification('Missing token');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification('Passwords do not match');
      setNotificationType('error');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    try {
      await changePassword(oldPassword, newPassword, token);
      setNotification('Password changed successfully');
      setNotificationType('success');
      setTimeout(() => setNotification(''), 5000);
      setShowForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Your current password is incorrect');
      setNotificationType('error');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  return (
    <div >
      <h1 className="text-3xl font-bold text-title mb-8 duration-500">Profile</h1>

      <div className="bg-page duration-500 rounded-xl shadow-md border border-border p-6 grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 py-17">
        <div className="flex flex-col items-center justify-center text-center md:text-left ">
          <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
            <UserIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-title duration-500">{user?.name}</h2>

          <div className="w-[calc(100%-6rem)] border-t border-gray-300 my-4"></div>

          <div className="flex flex-col gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className='text-title duration-500'>Total Expense: {totalExpenses}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className='text-title duration-500'>Total Income: {totalIncomes}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className='text-title duration-500'>Total Categories: {totalCategories} </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-title mb-2 duration-500">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-title uppercase duration-500">Name</p>
                <p className="text-lg font-semibold text-title duration-500">{user?.name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-title uppercase duration-500">Email</p>
                <div className="flex items-center gap-2 text-title duration-500">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-title uppercase mb-1 duration-500">Member since</p>
              <div className="flex items-center gap-2 text-title duration-500">
                <Calendar className="h-4 w-4" />
                <span>{user?.createdAt?.split('T')[0].replaceAll('-', '/')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="mt-10 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 self-start"
          >
            <Lock className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="absolute w-full inset-0 bg-black/20 backdrop-blur-sm z-40 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
              className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${notificationType === 'success'
              ? 'bg-green-500 text-white'
              : 'border-red-300 text-red-800 bg-red-100'
              }`}
          >
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
