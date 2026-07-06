import React, { useState } from 'react';
import styles from './LihatData.module.css';
import { Recipient, UserSession } from '../types';

interface LihatDataProps {
  recipients?: Recipient[];
  userSession?: UserSession;
  onDelete?: (niks: string[]) => void;
  onUpdate?: (updatedRec: Recipient) => void;
}

export default function LihatData({
  recipients = [],
  userSession,
  onDelete,
  onUpdate,
}: LihatDataProps) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterTahun, setFilterTahun] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique years dynamically from recipients
  const tahunOptions = ['Semua', ...Array.from(new Set(recipients.map((r) => r.tahun).filter(Boolean))).sort()];

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.nama.toLowerCase().includes(search.toLowerCase()) ||
      recipient.nik.includes(search);
    const matchesKategori = filterKategori === 'Semua' || recipient.kategori === filterKategori;
    const matchesTahun = filterTahun === 'Semua' || recipient.tahun === filterTahun;
    const matchesStatus = filterStatus === 'Semua' || recipient.status === filterStatus;

    // Tampilkan semua nama yang terdaftar seperti di homepage
    const matchesKecamatan = true;

    return matchesSearch && matchesKategori && matchesTahun && matchesStatus && matchesKecamatan;
  });

  const itemsPerPage = 10;
  const pageCount = Math.ceil(filteredRecipients.length / itemsPerPage) || 1;
  const paginatedRecipients = filteredRecipients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );





  return (
    <div className={styles.container} id="lihat-data-container" onClick={() => setOpenDropdown(null)}>
      {/* Table Card container element */}
      <div className={styles.tableContainer}>
        {/* Dynamic header input filters */}
        <div className={styles.filterHeader}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>search</span>
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              id="input-search-recipients"
            />
          </div>

          <div className={styles.rightControls}>
            <div className={styles.leftActions}>
            </div>

            <div className={styles.rightFilters}>
              {/* Filter Tahun */}
              <div
                className={styles.customSelectWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'filter-tahun' ? null : 'filter-tahun');
                }}
              >
                <div className={`${styles.customSelect} ${openDropdown === 'filter-tahun' ? styles.inputFocused : ''}`}>
                  {filterTahun === 'Semua' ? 'Semua Periode' : `Tahun ${filterTahun}`}
                  <span className={`${styles.arrowIcon} ${openDropdown === 'filter-tahun' ? styles.arrowUp : ''}`}>
                    expand_more
                  </span>
                </div>

                {openDropdown === 'filter-tahun' && (
                  <div className={styles.dropdownMenu}>
                    {tahunOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${filterTahun === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterTahun(opt);
                          setCurrentPage(1);
                          setOpenDropdown(null);
                        }}
                      >
                        {opt === 'Semua' ? 'Semua Periode' : opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Kategori */}
              <div
                className={styles.customSelectWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'filter-kategori' ? null : 'filter-kategori');
                }}
              >
                <div className={`${styles.customSelect} ${openDropdown === 'filter-kategori' ? styles.inputFocused : ''}`}>
                  {filterKategori === 'Semua' ? 'Semua Kategori' : filterKategori}
                  <span className={`${styles.arrowIcon} ${openDropdown === 'filter-kategori' ? styles.arrowUp : ''}`}>
                    expand_more
                  </span>
                </div>

                {openDropdown === 'filter-kategori' && (
                  <div className={styles.dropdownMenu}>
                    {['Semua', 'Guru Mengaji', 'Pimpinan Pondok'].map((opt) => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${filterKategori === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterKategori(opt);
                          setCurrentPage(1);
                          setOpenDropdown(null);
                        }}
                      >
                        {opt === 'Semua' ? 'Semua Kategori' : opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Status */}
              <div
                className={styles.customSelectWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'filter-status' ? null : 'filter-status');
                }}
              >
                <div className={`${styles.customSelect} ${openDropdown === 'filter-status' ? styles.inputFocused : ''}`}>
                  {filterStatus === 'Semua' ? 'Semua Status' : filterStatus}
                  <span className={`${styles.arrowIcon} ${openDropdown === 'filter-status' ? styles.arrowUp : ''}`}>
                    expand_more
                  </span>
                </div>

                {openDropdown === 'filter-status' && (
                  <div className={styles.dropdownMenu}>
                    {['Semua', 'Pending', 'Terverifikasi', 'Ditolak'].map((opt) => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${filterStatus === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterStatus(opt);
                          setCurrentPage(1);
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
          </div>
        </div>

        {/* Tabular data listing */}
        <div className={styles.tableWrapper}>
          {filteredRecipients.length > 0 ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>No</th>
                    <th className={styles.th}>Nama Lengkap</th>
                    <th className={styles.th}>Kategori</th>
                    <th className={styles.th}>Kecamatan</th>
                    <th className={styles.th}>Status Berkas</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecipients.map((rec, index) => (
                    <tr
                      key={index}
                      className={styles.tr}
                    >
                      <td className={styles.td}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className={`${styles.td} ${styles.recipientName}`}>{rec.nama}</td>
                      <td className={styles.td}>{rec.kategori}</td>
                      <td className={styles.td}>{rec.kecamatan}</td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${
                            rec.status === 'Terverifikasi'
                              ? styles.badgeActive
                              : rec.status === 'Pending'
                              ? styles.badgePending
                              : styles.badgeVerified
                          }`}
                        >
                          <span className={styles.badgeText}>{rec.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Simple table footer pagination */}
              <div className="p-4 border-t border-slate-150 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
                <span>
                  Menampilkan <b className="text-slate-800">{paginatedRecipients.length}</b> dari <b className="text-slate-800">{filteredRecipients.length}</b> baris
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <span className="material-symbols-outlined text-sm block">chevron_left</span>
                  </button>
                  <span className="px-3">Halaman {currentPage} dari {pageCount}</span>
                  <button
                    type="button"
                    className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                    disabled={currentPage === pageCount}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <span className="material-symbols-outlined text-sm block">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>search_off</span>
              <p>Tidak ada data penerima yang cocok dengan pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}