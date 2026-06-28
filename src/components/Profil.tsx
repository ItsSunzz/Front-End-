import React, { useState } from 'react';
import { UserSession } from '../types';
import { api } from '../api';

interface ProfilProps {
  userSession: UserSession;
  onUpdateSession: (updatedSession: Partial<UserSession>) => void;
  lastLogoutTime: Date | null;
}

export default function Profil({ userSession, onUpdateSession, lastLogoutTime }: ProfilProps) {
  const email = userSession.email || 'kecamatan@boyolali.go.id';

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError('Harap lengkapi semua kolom password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Sandi baru dan konfirmasi sandi tidak cocok.');
      return;
    }

    try {
      await api.changePassword(oldPassword, newPassword);
      setPassSuccess('Sandi Anda berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Gagal memperbarui kata sandi.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="profil-container" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* SECTION 1: Personal & Account Identity */}
      <div className="bg-white border border-[#c1c8c0] rounded-2xl shadow-sm p-8">
        <h3 className="text-[#001408] text-lg font-bold border-b pb-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#007432]">badge</span>
          <span>Identitas Personal & Akun</span>
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Username / Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username / Email</label>
              <input
                type="email"
                disabled
                className="w-full px-4 py-3 border border-[#cbd5e1] bg-[#f8fafc] rounded-xl outline-none text-slate-500 font-semibold text-sm cursor-not-allowed"
                value={email}
              />
              <span className="text-[11px] text-gray-400">Digunakan untuk login (Tidak dapat diubah)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Security & Password */}
      <div className="bg-white border border-[#c1c8c0] rounded-2xl shadow-sm p-8">
        <h3 className="text-[#001408] text-lg font-bold border-b pb-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#007432]">lock_open</span>
          <span>Keamanan & Pengaturan Akun</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-6">
          {passError && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-200 text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{passSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sandi Lama */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sandi Lama</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-[#cbd5e1] rounded-xl outline-none focus:border-[#007432] focus:ring-2 focus:ring-[#007432]/10 transition-all font-semibold text-gray-800 text-sm"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>

            {/* Sandi Baru */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sandi Baru</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-[#cbd5e1] rounded-xl outline-none focus:border-[#007432] focus:ring-2 focus:ring-[#007432]/10 transition-all font-semibold text-gray-800 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>

            {/* Konfirmasi Sandi Baru */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Sandi Baru</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-[#cbd5e1] rounded-xl outline-none focus:border-[#007432] focus:ring-2 focus:ring-[#007432]/10 transition-all font-semibold text-gray-800 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi sandi baru"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#007432] hover:bg-[#005926] text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 border-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              <span>Ubah Password</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
