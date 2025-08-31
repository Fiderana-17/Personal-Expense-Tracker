import React, { useState } from 'react';
import { User, Mail, Calendar, Save, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { changePassword } from '@/api/auth';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (!token) {
      setNotificationType('error');
      setTimeout(() => setNotification(''), 5000);
      return;
    } try {
      await changePassword(oldPassword, newPassword, token);
      setNotification('Password changed successfully');
      setNotificationType('success'); setTimeout(() => setNotification(''), 5000);
      if (newPassword !== confirmPassword) {
        setNotification('Passwords do not match');
        setNotificationType('error'); setTimeout(() => setNotification(''), 5000);
        return;
      }
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Your current password is incorrect');
      setNotificationType('error'); setTimeout(() => setNotification(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <Calendar className="h-4 w-4" />
              <span>
                Member since {user?.createdAt.split('-').join('/').slice(0, 10)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
          <input
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-13 -translate-y-1/2 text-gray-400"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-13 -translate-y-1/2 text-gray-400"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-13 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </button>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`absolute top-6 left-1/2 -translate-x-1/2 border px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notificationType === 'success'
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
