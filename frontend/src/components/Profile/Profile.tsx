import { UserIcon, Lock, Database, Calendar, AlertCircle, Pencil, Eye, EyeOff, Save, Mail, X } from 'lucide-react';
import { uploadProfilePic, getMe, changePassword } from '@/api/auth';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/FormatDate';
import { useTranslation } from "react-i18next";

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [profilePic, setProfilePic] = useState<string>(user?.profilePic || '');
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
  
  const fetchUser = async () => {
    if (!token) return;
    try {
      const data = await getMe(token);
      setProfilePic(data.profilePic || '');
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : t("errors.unknown"));
      setNotificationType('error');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !e.target.files || !e.target.files[0]) return;
    try {
      await uploadProfilePic(e.target.files[0], token);
      setNotification(t("messages.profileUpdated"));
      setNotificationType('success');
      fetchUser();
    } catch (err) {
      setNotification(err instanceof Error ? err.message : t("errors.uploadFailed"));
      setNotificationType('error');
    }
  };

  const handleSave = async () => {
    if (!token) {
      setNotificationType('error');
      setNotification(t("errors.missingToken"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification(t("errors.passwordMismatch"));
      setNotificationType('error');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword, token);
      setNotification(t("messages.passwordChanged"));
      setNotificationType('success');
      setShowForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setNotification(err instanceof Error ? err.message : t("errors.wrongPassword"));
      setNotificationType('error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-title mb-8 duration-500">{t("profile.title")}</h1>
      <div className="bg-page duration-500 rounded-xl shadow-md border border-border p-6 grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 py-17">
        <div className="flex flex-col items-center justify-center text-center md:text-left ">
          <div className="h-40 w-40 bg-blue-100 rounded-full flex items-center justify-center shadow-md relative">
            {profilePic ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${profilePic}`}
                alt={t("profile.imageAlt")}
                className="h-40 w-40 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-blue-600" />
            )}
            <label className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 flex items-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Pencil className="h-4 w-4" />
            </label>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-title duration-500">{user?.name}</h2>

          <div className="w-[calc(100%-6rem)] border-t border-gray-300 my-4"></div>

          <div className="flex flex-col gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className='text-title duration-500'>{t("profile.totalExpenses")}: {totalExpenses}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className='text-title duration-500'>{t("profile.totalIncomes")}: {totalIncomes}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className='text-title duration-500'>{t("profile.totalCategories")}: {totalCategories}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-title mb-2 duration-500">{t("profile.personalInfo")}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-title uppercase duration-500">{t("profile.name")}</p>
                <p className="text-lg font-semibold text-title duration-500">{user?.name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-title uppercase duration-500">{t("profile.email")}</p>
                <div className="flex items-center gap-2 text-title duration-500">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-title uppercase mb-1 duration-500">{t("profile.memberSince")}</p>
              <div className="flex items-center gap-2 text-title duration-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="mt-10 cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 self-start"
          >
            <Lock className="h-4 w-4" />
            <span>{t("profile.changePassword")}</span>
          </button>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
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
                <h2 className="text-lg font-semibold text-gray-800">{t("profile.changePassword")}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.oldPassword")}</label>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-9 text-gray-400 cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.newPassword")}</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-400 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("profile.confirmPassword")}</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={handleSave}
                className="w-full cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>{t("actions.save")}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications */}
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
