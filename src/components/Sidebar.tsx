// Sidebar.tsx — updated
import React from 'react';
import styles from './Sidebar.module.css';
import { ViewType, UserSession } from '../types';
import logoBoyolali from '../assets/LogoBoyolali.png';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userSession: UserSession;
  onLogout: () => void;
  onLoginClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  userSession,
  onLogout,
  onLoginClick,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <aside id="sidebar-panel" className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <img
          src={logoBoyolali}
          alt="Logo Kabupaten Boyolali"
          className={styles.logo}
        />
        <div className={styles.brandText}>
          <span className={styles.title}>PEMKAB BOYOLALI</span>
          <span className={styles.subtitle}>PEMERINTAH KABUPATEN BOYOLALI</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className={styles.menu}>
        <div className={styles.categoryTitle}>Menu Utama</div>

        {/* Dashboard — semua role */}
        <button
          id="nav-dashboard"
          className={`${styles.menuItem} ${currentView === 'dashboard' ? styles.activeItem : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <span className={`${styles.icon} material-symbols-outlined`}>dashboard</span>
          <span>Dashboard</span>
        </button>

        {/* Input Data — hanya non-Super Admin */}
        {userSession.isLoggedIn && userSession.role !== 'Super Admin' && (
          <button
            id="nav-input-data"
            className={`${styles.menuItem} ${currentView === 'input-data' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('input-data')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>edit_document</span>
            <span>Input Data</span>
          </button>
        )}

        {/* Kelola Data — hanya non-Super Admin yang sudah login */}
        {userSession.isLoggedIn && userSession.role !== 'Super Admin' && (
          <button
            id="nav-kelola-data"
            className={`${styles.menuItem} ${currentView === 'kelola-data' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('kelola-data')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>table_chart</span>
            <span>Kelola Data</span>
          </button>
        )}

        {/* Verifikasi Berkas — hanya Super Admin */}
        {userSession.isLoggedIn && userSession.role === 'Super Admin' && (
          <button
            id="nav-manajemen-user"
            className={`${styles.menuItem} ${currentView === 'manajemen-user' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('manajemen-user')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>fact_check</span>
            <span>Verifikasi Berkas</span>
          </button>
        )}
        {/* History — hanya Super Admin */}
        {userSession.isLoggedIn && userSession.role === 'Super Admin' && (
          <button
            id="nav-history"
            className={`${styles.menuItem} ${currentView === 'history' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('history')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>history</span>
            <span>Riwayat Data</span>
          </button>
        )}

        {/* Management User — hanya Super Admin */}
        {userSession.isLoggedIn && userSession.role === 'Super Admin' && (
          <button
            id="nav-user-management"
            className={`${styles.menuItem} ${currentView === 'user-management' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('user-management')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>manage_accounts</span>
            <span>Management User</span>
          </button>
        )}

        {/* Lihat Data — hanya non-Super Admin */}
        {(!userSession.isLoggedIn || userSession.role !== 'Super Admin') && (
          <button
            id="nav-lihat-data"
            className={`${styles.menuItem} ${currentView === 'lihat-data' ? styles.activeItem : ''}`}
            onClick={() => onViewChange('lihat-data')}
          >
            <span className={`${styles.icon} material-symbols-outlined`}>visibility</span>
            <span>Lihat Data</span>
          </button>
        )}

      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {userSession.isLoggedIn && (
          <div 
            className={`${styles.userCard} ${currentView === 'profil' ? styles.userCardActive : ''}`}
            onClick={() => onViewChange('profil')}
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userSession.nama}</span>
              <span className={styles.userRole}>{userSession.role}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}