import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { UserSession, Recipient } from '../types';

interface DashboardProps {
  userSession: UserSession;
  recipients?: Recipient[];
  onLoginClick: () => void;
  onNavigateToInput: () => void;
}

export default function Dashboard({
  userSession,
  recipients = [],
  onLoginClick,
  onNavigateToInput,
}: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);



  // General Subdistrict or Village Sebaran data calculated from database-backed recipients
  const getSubdistrictData = () => {
    const counts: Record<string, number> = {};
    const isKecamatanAdmin = userSession.isLoggedIn && userSession.role === 'Admin Kecamatan';

    recipients.forEach(r => {
      if (selectedCategory !== 'Semua Kategori' && r.kategori !== selectedCategory) {
        return;
      }

      // Group by desaKelurahan if logged in as Kecamatan Admin, otherwise group by kecamatan
      const key = isKecamatanAdmin ? (r.desaKelurahan || 'Lainnya') : (r.kecamatan || 'Lainnya');
      counts[key] = (counts[key] || 0) + 1;
    });

    const dataList = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    dataList.sort((a, b) => b.value - a.value);

    const colors = ['#007432', '#10b981', '#22c55e', '#84cc16', '#a3e635', '#6bee8f', '#34d399', '#059669', '#047857', '#065f46'];

    // If empty list, return a placeholder so the SVG doesn't break
    if (dataList.length === 0) {
      return [{ name: 'Belum Ada Data', value: 0, color: '#f2f4f6' }];
    }

    return dataList.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    }));
  };

  const districtList = getSubdistrictData();
  const totalVerified = districtList.reduce((sum, item) => sum + item.value, 0);

  // Helper to extract double initials
  const getInitials = (name: string) => {
    const tokens = name.trim().split(' ');
    if (tokens.length >= 2) {
      return (tokens[0][0] + tokens[1][0]).toUpperCase();
    }
    return tokens[0] ? tokens[0].slice(0, 2).toUpperCase() : 'B';
  };

  // Helper to assign random avatar bg colors matching figma circles
  const getAvatarBgClass = (index: number) => {
    const list = [
      'bg-emerald-100 text-emerald-800',
      'bg-teal-100 text-teal-800',
      'bg-blue-100 text-blue-800',
      'bg-cyan-100 text-cyan-800',
      'bg-sky-100 text-sky-800',
    ];
    return list[index % list.length];
  };

  // Real data calculations for Kecamatan Dashboard based on recipients state prop
  const activeRecipients = recipients;
  const countTerverifikasi = activeRecipients.filter(r => r.status === 'Terverifikasi').length;
  const countPending = activeRecipients.filter(r => r.status === 'Pending').length;
  const countDitolak = activeRecipients.filter(r => r.status === 'Ditolak').length;



  // -------------------------------------------------------------
  // VIEW 1: KECAMATAN PORTAL DASHBOARD (Logged-In View)
  // -------------------------------------------------------------
  if (userSession.isLoggedIn) {
    return (
      <div className={styles.container} id="kecamatan-dashboard-view" onClick={() => setOpenDropdown(null)}>
        {/* 1. Welcoming Hero Banner */}
        <div className={styles.heroBanner} id="hero-banner-kecamatan">
          <div className={styles.heroLeft}>
            <p className={styles.heroTag}>Sistem Pendataan - Boyolali</p>
            <h1 className={styles.heroTitle}>Selamat Datang, {userSession.nama}</h1>
            <p className={styles.heroDesc}>
              Ringkasan monitoring dan pengawasan penyaluran bantuan dana hibah keagamaan bagi Guru Mengaji dan Pimpinan Pondok Pesantren di wilayah {userSession.role || 'Kabupaten Boyolali'}.
            </p>
          </div>
        </div>

        {/* 2. Statistik Ringkas Track Row */}
        <section className={styles.statsRow} id="summary-stats-cards-kecamatan">
          {/* Total Terdaftar */}
          <div className={styles.statsCard}>
            <div className={styles.statsLeft}>
              <span className={styles.statsTitle}>Total Pengajuan Data</span>
              <span className={styles.statsValue}>{activeRecipients.length}</span>
              <span className={`${styles.statsBadge} ${styles.badgePlus}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span>
                <span>Aktif</span>
              </span>
            </div>
            <div className={styles.statsIcon}>
              <span>group</span>
            </div>
          </div>

          {/* Menunggu Verifikasi */}
          <div className={styles.statsCard}>
            <div className={styles.statsLeft}>
              <span className={styles.statsTitle}>Menunggu Verifikasi</span>
              <span className={styles.statsValue}>{countPending} Berkas</span>
              <span className={`${styles.statsBadge} ${styles.badgeWarning}`}>
                <span>Pending</span>
              </span>
            </div>
            <div className={styles.statsIcon}>
              <span>pending_actions</span>
            </div>
          </div>

          {/* Data Terverifikasi */}
          <div className={styles.statsCard}>
            <div className={styles.statsLeft}>
              <span className={styles.statsTitle}>Data Terverifikasi</span>
              <span className={styles.statsValue}>{countTerverifikasi} Berkas</span>
              <span className={`${styles.statsBadge} ${styles.badgePlus}`}>
                <span>Valid</span>
              </span>
            </div>
            <div className={styles.statsIcon}>
              <span>verified</span>
            </div>
          </div>
        </section>

        {/* 3. Row Bento splits (Visual Graphics Donut Chart) */}
        <section className={styles.bentoRow}>
          {/* Sebaran Wilayah */}
          <div className={styles.bentoCard} id="card-chart-sebaran-kecamatan">
            <div className={styles.cardHeader}>
              <div className={styles.cardHeading}>
                <span className={styles.cardHeadingIcon}>pie_chart</span>
                <span>Grafik Sebaran per Desa</span>
              </div>
              <div
                className={styles.customSelectWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'chart-kategori-kec' ? null : 'chart-kategori-kec');
                }}
              >
                <div className={`${styles.customSelect} ${openDropdown === 'chart-kategori-kec' ? styles.inputFocused : ''}`}>
                  <span className={styles.selectLabel}>{selectedCategory}</span>
                  <span className={`${styles.arrowIcon} ${openDropdown === 'chart-kategori-kec' ? styles.arrowUp : ''}`}>expand_more</span>
                </div>

                {openDropdown === 'chart-kategori-kec' && (
                  <div className={styles.dropdownMenu}>
                    {['Semua Kategori', 'Guru Mengaji', 'Pimpinan Pondok'].map(opt => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${selectedCategory === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(opt);
                          setOpenDropdown(null);
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.donutLayout}>
              {/* SVG Donut Graphic */}
              <div className={styles.chartWrapper}>
                <svg width="240" height="240" viewBox="0 0 120 120" className={styles.donutSvg}>
                  {/* Background ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#f2f4f6"
                    strokeWidth="12"
                  />
                  {(() => {
                    const r = 50;
                    const circumference = 2 * Math.PI * r;
                    let accumulatedOffset = 0;
                    return districtList.map((item) => {
                      const strokeLength = (item.value / totalVerified) * circumference;
                      const strokeOffset = circumference - accumulatedOffset;
                      accumulatedOffset += strokeLength;
                      return (
                        <circle
                          key={item.name}
                          cx="60"
                          cy="60"
                          r={r}
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={`${strokeLength} ${circumference}`}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="butt"
                          className="transition-all duration-300 hover:stroke-[14px]"
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    });
                  })()}
                </svg>

                <div className={styles.centerLabel}>
                  <span className={styles.centerTotal}>{totalVerified}</span>
                  <span className={styles.centerTitle}>Total Penerima</span>
                </div>
              </div>

              {/* Scannable Legend Items */}
              <div className={styles.legendList}>
                {districtList.map((item) => {
                  const percentage = (item.value / totalVerified) * 100;
                  return (
                    <div key={item.name} className={styles.legendItem}>
                      <div className={styles.legendLeft}>
                        <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                        <span className={styles.legendName}>{item.name}</span>
                      </div>
                      <div className={styles.legendRight}>
                        <span className={styles.legendCount}>{item.value} Pengajuan</span>
                        <span className={styles.legendPercentage}>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: PUBLIC GUEST DASHBOARD (Standard general dashboard view)
  // -------------------------------------------------------------
  return (
    <div className={styles.container} id="dashboard-container" onClick={() => setOpenDropdown(null)}>
      {/* 1. Welcoming Hero Banner */}
      <div className={styles.heroBanner} id="hero-banner-public">
        <div className={styles.heroLeft}>
          <p className={styles.heroTag}>Pemerintah Kabupaten Boyolali</p>
          <h1 className={styles.heroTitle}>Portal Penyaluran Hibah & Bantuan Kesejahteraan</h1>
          <p className={styles.heroDesc}>
            Layanan keterbukaan informasi, monitoring, dan pengawasan penyaluran bantuan dana hibah keagamaan bagi Guru Mengaji dan Pimpinan Pondok Pesantren di wilayah Kabupaten Boyolali.
          </p>
        </div>
      </div>

      {/* 2. Statistik Ringkas Track Row */}
      <section className={styles.statsRow} id="summary-stats-cards">
        {/* Total Terdaftar */}
        <div className={styles.statsCard}>
          <div className={styles.statsLeft}>
            <span className={styles.statsTitle}>Total Penngajuan Data</span>
            <span className={styles.statsValue}>{recipients.length}</span>
            <span className={`${styles.statsBadge} ${styles.badgePlus}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span>
              <span>Aktif</span>
            </span>
          </div>
          <div className={styles.statsIcon}>
            <span>group</span>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className={styles.statsCard}>
          <div className={styles.statsLeft}>
            <span className={styles.statsTitle}>Menunggu Verifikasi</span>
            <span className={styles.statsValue}>{recipients.filter(r => r.status === 'Pending').length} Berkas</span>
            <span className={`${styles.statsBadge} ${styles.badgeWarning}`}>
              <span>Pending</span>
            </span>
          </div>
          <div className={styles.statsIcon}>
            <span>pending_actions</span>
          </div>
        </div>

        {/* Data Terverifikasi */}
        <div className={styles.statsCard}>
          <div className={styles.statsLeft}>
            <span className={styles.statsTitle}>Data Terverifikasi</span>
            <span className={styles.statsValue}>{recipients.filter(r => r.status === 'Terverifikasi').length} Berkas</span>
            <span className={`${styles.statsBadge} ${styles.badgePlus}`}>
              <span>Valid</span>
            </span>
          </div>
          <div className={styles.statsIcon}>
            <span>verified</span>
          </div>
        </div>
      </section>

      {/* 3. Row Bento splits (Visual Graphics Donut Chart) */}
      <section className={styles.bentoRow}>
        {/* Sebaran Wilayah */}
        <div className={styles.bentoCard} id="card-chart-sebaran">
          <div className={styles.cardHeader}>
            <div className={styles.cardHeading}>
              <span className={styles.cardHeadingIcon}>pie_chart</span>
              <span>Grafik Sebaran Wilayah</span>
            </div>
            <div
              className={styles.customSelectWrapper}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === 'chart-kategori' ? null : 'chart-kategori');
              }}
            >
              <div className={`${styles.customSelect} ${openDropdown === 'chart-kategori' ? styles.inputFocused : ''}`}>
                <span className={styles.selectLabel}>{selectedCategory}</span>
                <span className={`${styles.arrowIcon} ${openDropdown === 'chart-kategori' ? styles.arrowUp : ''}`}>expand_more</span>
              </div>

              {openDropdown === 'chart-kategori' && (
                <div className={styles.dropdownMenu}>
                  {['Semua Kategori', 'Guru Mengaji', 'Pimpinan Pondok'].map(opt => (
                    <div
                      key={opt}
                      className={`${styles.dropdownItem} ${selectedCategory === opt ? styles.dropdownItemSelected : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(opt);
                        setOpenDropdown(null);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.donutLayout}>
            {/* SVG Donut Graphic */}
            <div className={styles.chartWrapper}>
              <svg width="240" height="240" viewBox="0 0 120 120" className={styles.donutSvg}>
                {/* Background ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="#f2f4f6"
                  strokeWidth="12"
                />
                {(() => {
                  const r = 50;
                  const circumference = 2 * Math.PI * r;
                  let accumulatedOffset = 0;
                  return districtList.map((item) => {
                    const strokeLength = (item.value / totalVerified) * circumference;
                    const strokeOffset = circumference - accumulatedOffset;
                    accumulatedOffset += strokeLength;
                    return (
                      <circle
                        key={item.name}
                        cx="60"
                        cy="60"
                        r={r}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="butt"
                        className="transition-all duration-300 hover:stroke-[14px]"
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  });
                })()}
              </svg>

              <div className={styles.centerLabel}>
                <span className={styles.centerTotal}>{totalVerified}</span>
                <span className={styles.centerTitle}>Total Penerima</span>
              </div>
            </div>

            {/* Scannable Legend Items */}
            <div className={styles.legendList}>
              {districtList.map((item) => {
                const percentage = (item.value / totalVerified) * 100;
                return (
                  <div key={item.name} className={styles.legendItem}>
                    <div className={styles.legendLeft}>
                      <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                      <span className={styles.legendName}>{item.name}</span>
                    </div>
                    <div className={styles.legendRight}>
                      <span className={styles.legendCount}>{item.value} Pengajuan</span>
                      <span className={styles.legendPercentage}>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
