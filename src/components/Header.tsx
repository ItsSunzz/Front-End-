import React, { useState } from 'react';
import styles from './Header.module.css';
import { ViewType, UserSession, FormData } from '../types';

interface HeaderProps {
  currentView: ViewType;
  userSession: UserSession;
  onLoginClick: () => void;
  onLogout: () => void;
  drafts?: { id: string; timestamp: Date; data: FormData }[];
  onLoadDraft?: (data: FormData, id: string) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ currentView, userSession, onLoginClick, onLogout, drafts = [], onLoadDraft, onToggleSidebar }: HeaderProps) {
  const [showDraftsDropdown, setShowDraftsDropdown] = useState(false);
  // Determine title and description based on view
  let title = 'Sistem Informasi Bantuan Sosial';
  let desc = 'Sekretariat Daerah Kabupaten Boyolali';

  switch (currentView) {
    case 'dashboard':
      title = 'Dashboard';
      desc = 'Statistik Ringkas & Sebaran Wilayah Bantuan Sosial';
      break;
    case 'input-data':
      title = 'Input Data';
      desc = 'Formulir Pendataan Penerima Bantuan Kesejahteraan';
      break;
    case 'lihat-data':
      title = 'Lihat Data';
      desc = 'Daftar lengkap penerima bantuan sosial terdaftar.';
      break;
    case 'profil':
      title = 'Profil Admin';
      desc = 'Detail akun administrator dan instansi kelayakan Sekretariat Daerah.';
      break;
    case 'pengaturan':
      title = 'Pengaturan';
      desc = 'Konfigurasi sistem, status API, dan parameter verifikasi penerima.';
      break;
    case 'kelola-data':
      title = 'Kelola Data';
      desc = 'Kelola pengajuan bantuan sosial untuk wilayah Anda.';
      break;
    case 'manajemen-user':
      title = 'Verifikasi Berkas';
      desc = 'Persetujuan, verifikasi, dan manajemen pengajuan berkas bantuan.';
      break;
    case 'history':
      title = 'Riwayat Data';
      desc = 'Daftar riwayat audit data pengajuan bantuan sosial.';
      break;
    case 'user-management':
      title = 'Management User';
      desc = 'Manajemen akun pengguna, reset sandi, hak akses, dan log audit sistem.';
      break;
  }

  // Indonesian Date Formatter helper
  const getIndonesianDateString = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    // Use current system date
    const date = new Date();
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  return (
    <header className={styles.header} id="main-header">
      {/* Title & Status */}
      <div className={styles.leftSection}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer border-0"
            onClick={onToggleSidebar}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <h2 className={styles.pageTitle} id="header-page-title">{title}</h2>
        </div>
        <p className={styles.pageDesc} id="header-page-desc">{desc}</p>
      </div>

      {/* Utilities */}
      <div className={styles.rightSection}>
        {/* Calendar Widget */}
        <div className={styles.calendarBadge}>
          <span className={`${styles.calendarIcon} material-symbols-outlined`}>calendar_today</span>
          <span>{getIndonesianDateString()}</span>
        </div>

        {userSession.isLoggedIn && (
          <>
            <div className={styles.divider} />

            {/* Drafts Dropdown Button */}
            <div className="relative">
              <button 
                type="button" 
                className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-[13px] font-semibold transition-colors whitespace-nowrap"
                onClick={() => setShowDraftsDropdown(!showDraftsDropdown)}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">draft</span>
                <span className="hidden sm:inline">Draft Tersimpan ({drafts.length})</span>
                <span className="sm:hidden">Draft ({drafts.length})</span>
              </button>
              
              {showDraftsDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">Data Draft</h4>
                    <span className="text-xs text-slate-500">{drafts.length} tersimpan</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {drafts.length > 0 ? (
                      drafts.map(draft => (
                        <div 
                          key={draft.id} 
                          className="px-4 py-3 border-b border-slate-50 hover:bg-emerald-50 cursor-pointer transition-colors"
                          onClick={() => {
                            onLoadDraft?.(draft.data, draft.id);
                            setShowDraftsDropdown(false);
                          }}
                        >
                          <p className="font-bold text-sm text-slate-800 mb-1">{draft.data.namaLengkap || 'Tanpa Nama'}</p>
                          <p className="text-xs text-slate-500 font-mono">{draft.data.nik || 'NIK Belum diisi'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{draft.timestamp.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Belum ada draft tersimpan.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className={styles.divider} />

        {/* User Login Toggle / Quick Profile details */}
        {userSession.isLoggedIn ? (
          <div className={styles.profileInfo} id="header-user-badge">

            


            <button 
              id="btn-header-logout" 
              className={styles.logoutBtnSmall} 
              onClick={onLogout}
              title="Keluar dari akun"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className={styles.logoutLabel}>Keluar</span>
            </button>
          </div>
        ) : (
          <button id="btn-header-login" className={styles.loginBtn} onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}
