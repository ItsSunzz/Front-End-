import React, { useState } from 'react';
import styles from './KelolaData.module.css';
import { Recipient, UserSession } from '../types';
import * as XLSX from 'xlsx';
import { api } from '../api';

interface KelolaDataProps {
  recipients?: Recipient[];
  userSession?: UserSession;
  onDelete?: (niks: string[]) => void;
  onUpdate?: (updatedRec: Recipient) => void;
  onRefresh?: () => void;
}

export default function KelolaData({
  recipients = [],
  userSession,
  onDelete,
  onUpdate,
  onRefresh,
}: KelolaDataProps) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterTahun, setFilterTahun] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('');

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNiks, setSelectedNiks] = useState<string[]>([]);
  const [niksToDelete, setNiksToDelete] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<Record<string, File>>({});
  const [desaOptions, setDesaOptions] = useState<string[]>([]);

  React.useEffect(() => {
    if (!userSession?.kecamatan) return;
    const loadDesa = async () => {
      try {
        const kList = await api.getKecamatan();
        const cleanActive = userSession.kecamatan.toLowerCase().replace('admin kecamatan', '').trim();
        const matchKec = kList.find(
          (k: any) => k.nama_kecamatan.toLowerCase().trim() === cleanActive
        );
        if (matchKec) {
          const dList = await api.getDesa(matchKec.kecamatan_id);
          setDesaOptions(dList.map((d: any) => d.nama_desa).sort());
        }
      } catch (err) {
        console.error('Gagal mengambil data desa:', err);
      }
    };
    loadDesa();
  }, [userSession?.kecamatan]);

  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Recipient>>({});

  // Get unique years dynamically from recipients matching the kecamatan
  const kecamatanRecipients = recipients.filter(r => r.kecamatan === userSession?.kecamatan);
  const tahunOptions = ['Semua', ...Array.from(new Set(kecamatanRecipients.map((r) => r.tahun).filter(Boolean))).sort()];

  // Filter recipients by logged-in district and search input
  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.nama.toLowerCase().includes(search.toLowerCase()) ||
      recipient.nik.includes(search);
    const matchesKategori = filterKategori === 'Semua' || recipient.kategori === filterKategori;
    const matchesTahun = filterTahun === 'Semua' || recipient.tahun === filterTahun;
    const matchesStatus = filterStatus === 'Semua' || recipient.status === filterStatus;

    // Filter strictly by the current Kecamatan's session (must match)
    const matchesKecamatan = recipient.kecamatan === userSession?.kecamatan;

    return matchesSearch && matchesKategori && matchesTahun && matchesStatus && matchesKecamatan;
  });

  // Sort filteredRecipients so that newer tanggalInput appears at the top
  const sortedRecipients = [...filteredRecipients].sort((a, b) => {
    if (!a.tanggalInput) return 1;
    if (!b.tanggalInput) return -1;

    const parseDate = (str: string) => {
      const parts = str.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      }
      return new Date(str).getTime() || 0;
    };

    return parseDate(b.tanggalInput) - parseDate(a.tanggalInput);
  });

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedNiks(sortedRecipients.map((r) => r.nik));
    } else {
      setSelectedNiks([]);
    }
  };

  const handleToggleSelect = (nik: string) => {
    setSelectedNiks((prev) =>
      prev.includes(nik) ? prev.filter((n) => n !== nik) : [...prev, nik]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedNiks.length > 0) {
      setNiksToDelete(selectedNiks);
    }
  };

  const handleDeleteSingle = (nik: string) => {
    setNiksToDelete([nik]);
  };

  const handleExport = () => {
    const dataToExport = filteredRecipients.map((r, index) => {
      const dusun = r.dusun || '';
      const rt = r.rt ? `RT.${r.rt}` : '';
      const rw = r.rw ? `RW.${r.rw}` : '';
      const desa = r.desaKelurahan || '';

      const alamat = [dusun, rt, rw, desa].filter(Boolean).join(' ');

      return {
        No: index + 1,
        'Nama Lengkap': r.nama,
        'Alamat': alamat,
        'Kecamatan': r.kecamatan,
        'Nomor Rekening': r.noRekening || '-',
        'NIK': r.nik,

      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penerima');
    XLSX.writeFile(workbook, `Data_Penerima_${userSession?.kecamatan || 'Kecamatan'}.xlsx`);
  };

  const handleRowClick = (rec: Recipient) => {
    setSelectedRecipient(rec);
    setEditFormData(rec);
    setIsEditing(false);
    setNewFiles({});
  };

  const handleSaveEdit = () => {
    if (selectedRecipient && onUpdate) {
      onUpdate({ ...selectedRecipient, ...editFormData, newFiles } as any);
      setSelectedRecipient(null);
      setNewFiles({});
    }
  };

  return (
    <div className={styles.container} id="kelola-data-container" onClick={() => setOpenDropdown(null)}>
      {/* Table Card container */}
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.rightControls}>
            <div className={styles.leftActions}>
              <button
                className={`${styles.actionBtn} ${isSelecting ? styles.btnActive : styles.btnPilih}`}
                onClick={() => {
                  setIsSelecting(!isSelecting);
                  setSelectedNiks([]);
                }}
              >
                {isSelecting && <span className="material-symbols-outlined">close</span>}
                {isSelecting ? 'Batal Pilih' : 'Pilih'}
              </button>

              {isSelecting && selectedNiks.length > 0 && (
                <>
                  <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={handleDeleteSelected}>
                    <span className="material-symbols-outlined">delete</span>
                    Hapus ({selectedNiks.length})
                  </button>
                  <button className={`${styles.actionBtn} ${styles.btnExport}`} onClick={handleExport}>
                    <span className="material-symbols-outlined">download</span>
                    Export Excel
                  </button>
                </>
              )}
            </div>

            <div className={`${styles.rightFilters} ${isSelecting ? styles.gridFilters : ''}`}>
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
            <table className={styles.table}>
              <thead>
                <tr>
                  {isSelecting && (
                    <th className={styles.th} style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        onChange={handleToggleSelectAll}
                        checked={
                          selectedNiks.length === sortedRecipients.length &&
                          sortedRecipients.length > 0
                        }
                      />
                    </th>
                  )}
                  <th className={styles.th}>No</th>
                  <th className={styles.th}>Nama Lengkap</th>
                  <th className={styles.th}>NIK</th>
                  <th className={styles.th}>Kategori</th>
                  <th className={styles.th}>Tanggal Input</th>
                  <th className={styles.th}>Bank Operasional</th>
                  <th className={styles.th}>Status Berkas</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecipients.map((rec, index) => (
                  <tr
                    key={index}
                    className={styles.tr}
                    onClick={() => !isSelecting && handleRowClick(rec)}
                    style={{ cursor: isSelecting ? 'default' : 'pointer' }}
                  >
                    {isSelecting && (
                      <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedNiks.includes(rec.nik)}
                          onChange={() => handleToggleSelect(rec.nik)}
                        />
                      </td>
                    )}
                    <td className={styles.td}>{index + 1}</td>
                    <td className={`${styles.td} ${styles.recipientName}`}>{rec.nama}</td>
                    <td className={styles.td}>{rec.nik}</td>
                    <td className={styles.td}>{rec.kategori}</td>
                    <td className={styles.td}>{rec.tanggalInput || '-'}</td>
                    <td className={styles.td}>{rec.bank}</td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.badge} ${rec.status === 'Terverifikasi'
                          ? styles.badgeActive
                          : rec.status === 'Pending'
                            ? styles.badgePending
                            : styles.badgeVerified
                          }`}
                      >
                        <span className={styles.badgeText}>{rec.status}</span>
                      </span>
                    </td>
                    <td className={styles.td} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-2">
                        {rec.status === 'Pending' && (
                          <button
                            className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border border-emerald-200 transition-colors"
                            style={{ height: '32px', boxSizing: 'border-box' }}
                            onClick={() => {
                              handleRowClick(rec);
                              setIsEditing(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Edit</span>
                          </button>
                        )}
                        {rec.status === 'Ditolak' && (
                          <button
                            className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border border-amber-200 transition-colors"
                            style={{ height: '32px', boxSizing: 'border-box' }}
                            onClick={() => {
                              handleRowClick(rec);
                              setIsEditing(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">autorenew</span>
                            <span>Pengajuan Ulang</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>search_off</span>
              <p>Tidak ada data penerima yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedRecipient && (
        <div className={styles.modalOverlay} onClick={() => { setSelectedRecipient(null); setOpenDropdown(null); }}>
          <div className={styles.modalContent} onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Rincian & Edit Data Penerima</h2>
              <button className={styles.modalCloseBtn} onClick={() => { setSelectedRecipient(null); setOpenDropdown(null); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              {selectedRecipient.status === 'Ditolak' && selectedRecipient.catatan && (
                <div className={styles.rejectionAlert}>
                  <span className={`${styles.rejectionIcon} material-symbols-outlined`}>warning</span>
                  <div className={styles.rejectionContent}>
                    <h4>Alasan Penolakan dari Super Admin:</h4>
                    <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5', color: '#7f1d1d' }}>{selectedRecipient.catatan}</p>
                  </div>
                </div>
              )}
              <div className={styles.detailGrid}>
                {/* Nama Lengkap */}
                <div className={styles.detailGroup}>
                  <label>Nama Lengkap</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.nama || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.nama}</p>
                  )}
                </div>

                {/* NIK */}
                <div className={styles.detailGroup}>
                  <label>NIK</label>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={16}
                      value={editFormData.nik || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, nik: e.target.value.replace(/\D/g, '') })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.nik}</p>
                  )}
                </div>

                {/* Kategori */}
                <div className={styles.detailGroup} style={{ position: 'relative' }}>
                  <label>Kategori</label>
                  {isEditing ? (
                    <div
                      className={styles.customSelectWrapper}
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === 'edit-kategori' ? null : 'edit-kategori');
                      }}
                    >
                      <div className={`${styles.customSelect} ${openDropdown === 'edit-kategori' ? styles.inputFocused : ''}`} style={{ borderRadius: '8px' }}>
                        <span>{editFormData.kategori || 'Pilih Kategori'}</span>
                        <span className={`${styles.arrowIcon} ${openDropdown === 'edit-kategori' ? styles.arrowUp : ''}`}>
                          expand_more
                        </span>
                      </div>

                      {openDropdown === 'edit-kategori' && (
                        <div className={styles.dropdownMenu} style={{ top: '100%', width: '100%', boxSizing: 'border-box' }}>
                          {['Guru Mengaji', 'Pimpinan Pondok'].map((opt) => (
                            <div
                              key={opt}
                              className={`${styles.dropdownItem} ${editFormData.kategori === opt ? styles.dropdownItemSelected : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditFormData({ ...editFormData, kategori: opt });
                                setOpenDropdown(null);
                              }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{selectedRecipient.kategori}</p>
                  )}
                </div>

                {/* Desa/Kelurahan */}
                <div className={styles.detailGroup} style={{ position: 'relative' }}>
                  <label>Desa/Kelurahan</label>
                  {isEditing ? (
                    <div
                      className={styles.customSelectWrapper}
                      style={{ width: '100%' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="-- Pilih atau Ketik Desa --"
                        className={styles.editInput}
                        value={editFormData.desaKelurahan || ''}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, desaKelurahan: e.target.value });
                          setOpenDropdown('edit-desa');
                        }}
                        onFocus={() => {
                          if (desaOptions.length > 0) {
                            setOpenDropdown('edit-desa');
                          }
                        }}
                        style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
                      />
                      <span
                        className={`${styles.arrowIcon} ${openDropdown === 'edit-desa' ? styles.arrowUp : ''}`}
                        style={{ position: 'absolute', right: '12px', bottom: '10px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (desaOptions.length > 0) {
                            setOpenDropdown(openDropdown === 'edit-desa' ? null : 'edit-desa');
                          }
                        }}
                      >
                        expand_more
                      </span>

                      {openDropdown === 'edit-desa' && (
                        <div className={styles.dropdownMenu} style={{ top: '100%', width: '100%', boxSizing: 'border-box', maxHeight: '200px', overflowY: 'auto' }}>
                          {desaOptions
                            .filter((opt) =>
                              opt.toLowerCase().includes((editFormData.desaKelurahan || '').toLowerCase())
                            )
                            .map((opt) => (
                              <div
                                key={opt}
                                className={`${styles.dropdownItem} ${editFormData.desaKelurahan === opt ? styles.dropdownItemSelected : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFormData({ ...editFormData, desaKelurahan: opt });
                                  setOpenDropdown(null);
                                }}
                              >
                                {opt}
                              </div>
                            ))
                          }
                          {desaOptions.filter((opt) =>
                            opt.toLowerCase().includes((editFormData.desaKelurahan || '').toLowerCase())
                          ).length === 0 && (
                              <div style={{ padding: '10px 16px', fontSize: '13px', color: '#717972' }}>
                                Tidak ada desa yang cocok
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{selectedRecipient.desaKelurahan || '-'}</p>
                  )}
                </div>

                {/* Dusun */}
                <div className={styles.detailGroup}>
                  <label>Dusun</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.dusun || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dusun: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.dusun || '-'}</p>
                  )}
                </div>

                {/* RT */}
                <div className={styles.detailGroup}>
                  <label>RT</label>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={3}
                      value={editFormData.rt || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rt: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.rt ? `RT.${selectedRecipient.rt}` : '-'}</p>
                  )}
                </div>

                {/* RW */}
                <div className={styles.detailGroup}>
                  <label>RW</label>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={3}
                      value={editFormData.rw || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rw: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.rw ? `RW.${selectedRecipient.rw}` : '-'}</p>
                  )}
                </div>

                {/* Nomor KK */}
                <div className={styles.detailGroup}>
                  <label>Nomor KK</label>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={16}
                      value={editFormData.noKK || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, noKK: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.noKK || '-'}</p>
                  )}
                </div>

                {/* Nomor Rekening */}
                <div className={styles.detailGroup}>
                  <label>Nomor Rekening</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.noRekening || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, noRekening: e.target.value.replace(/\D/g, '') })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.noRekening || '-'}</p>
                  )}
                </div>

                {/* Bank Operasional */}
                <div className={styles.detailGroup} style={{ position: 'relative' }}>
                  <label>Bank Operasional</label>
                  {isEditing ? (
                    <div
                      className={styles.customSelectWrapper}
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === 'edit-bank' ? null : 'edit-bank');
                      }}
                    >
                      <div className={`${styles.customSelect} ${openDropdown === 'edit-bank' ? styles.inputFocused : ''}`} style={{ borderRadius: '8px' }}>
                        <span>{editFormData.bank || 'Pilih Bank'}</span>
                        <span className={`${styles.arrowIcon} ${openDropdown === 'edit-bank' ? styles.arrowUp : ''}`}>
                          expand_more
                        </span>
                      </div>

                      {openDropdown === 'edit-bank' && (
                        <div className={styles.dropdownMenu} style={{ top: '100%', width: '100%', boxSizing: 'border-box' }}>
                          {['Bank Jateng', 'Bank Boyolali', 'Bank BKK'].map((opt) => (
                            <div
                              key={opt}
                              className={`${styles.dropdownItem} ${editFormData.bank === opt ? styles.dropdownItemSelected : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditFormData({ ...editFormData, bank: opt });
                                setOpenDropdown(null);
                              }}
                            >
                              {opt === 'Bank Jateng' ? 'Bank Jateng (Cab. Boyolali)' : opt === 'Bank Boyolali' ? 'Bank Boyolali' : 'Bank BKK Boyolali'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{selectedRecipient.bank || '-'}</p>
                  )}
                </div>

                {/* Masa Jabatan Mulai */}
                <div className={styles.detailGroup}>
                  <label>Tahun Berlaku Jabatan</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editFormData.masaJabatanMulai || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, masaJabatanMulai: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.masaJabatanMulai || '-'}</p>
                  )}
                </div>

                {/* Masa Jabatan Selesai */}
                <div className={styles.detailGroup}>
                  <label>Tahun Berakhir Jabatan</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editFormData.masaJabatanSelesai || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, masaJabatanSelesai: e.target.value })}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{selectedRecipient.masaJabatanSelesai || '-'}</p>
                  )}
                </div>
              </div>

              {/* Documents preview */}
              <div className={styles.docSection}>
                <h3 className={styles.docTitle}>Dokumen Terlampir</h3>
                <div className={styles.docList}>
                  {selectedRecipient.dokumenUploaded ? (
                    (() => {
                      const mapFrontendToBackendKey = (feKey: string): string => {
                        switch (feKey) {
                          case 'ktp': return 'foto_ktp';
                          case 'kk': return 'foto_kk';
                          case 'suratPutusan': return 'surat_putusan';
                          case 'suratKeterangan': return 'surat_keterangan';
                          case 'suratPimpinanPondok': return 'surat_pimpinan_pondok';
                          case 'suratGuruMengaji': return 'surat_guru_mengaji';
                          default: return feKey;
                        }
                      };

                      const getDocLabel = (feKey: string): string => {
                        switch (feKey) {
                          case 'ktp': return 'Foto KTP';
                          case 'kk': return 'Foto Kartu Keluarga (KK)';
                          case 'suratPutusan': return 'Surat Keputusan / Putusan';
                          case 'suratKeterangan': return 'Surat Keterangan Kecamatan';
                          case 'suratPimpinanPondok': return 'Surat Keterangan Pimpinan Pondok';
                          case 'suratGuruMengaji': return 'Surat Keterangan Guru Mengaji';
                          default: return feKey.toUpperCase();
                        }
                      };

                      return Object.entries(selectedRecipient.dokumenUploaded).map(([key, url]) => {
                        // Only show matching category documents
                        if (key === 'suratPimpinanPondok' && selectedRecipient.kategori !== 'Pimpinan Pondok') return null;
                        if (key === 'suratGuruMengaji' && selectedRecipient.kategori !== 'Guru Mengaji') return null;
                        if (key === 'suratKeterangan' && selectedRecipient.kategori !== 'Guru Mengaji') return null;

                        const backendKey = mapFrontendToBackendKey(key);
                        const isNewFileSelected = !!newFiles[backendKey];

                        return (
                          <div key={key} className={styles.docItem} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <span className="material-symbols-outlined text-emerald-600">description</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{getDocLabel(key)}</span>
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                {url && (
                                  <button
                                    type="button"
                                    className={styles.viewDocBtn}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                    onClick={() => {
                                      setPreviewUrl(url as string);
                                      setPreviewLabel(getDocLabel(key));
                                    }}
                                  >
                                    Lihat File
                                  </button>
                                )}

                                {isEditing && (
                                  <label
                                    className={styles.viewDocBtn}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      backgroundColor: '#3b82f6',
                                      color: '#ffffff',
                                      borderColor: '#2563eb',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload</span>
                                    {isNewFileSelected ? 'Ubah File' : 'Upload Baru'}
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf"
                                      style={{ display: 'none' }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setNewFiles(prev => ({ ...prev, [backendKey]: file }));
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                            {isEditing && isNewFileSelected && (
                              <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '28px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                <span>Terpilih: {newFiles[backendKey].name}</span>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <p className={styles.noDocText}>Tidak ada dokumen atau data belum lengkap.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {isEditing ? (
                <>
                  <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>
                    Batal
                  </button>
                  <button className={styles.btnSave} onClick={handleSaveEdit}>
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>
                  <span className="material-symbols-outlined">edit</span>
                  Edit Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewUrl && (
        <div className={styles.modalOverlay} onClick={() => setPreviewUrl(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', width: '90vw' }}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Dokumen: {previewLabel}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setPreviewUrl(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modalBody} style={{ textAlign: 'center', padding: '16px' }}>
              {previewUrl.startsWith('blob:') || previewUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                <img
                  src={previewUrl}
                  alt={previewLabel}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    borderRadius: '8px',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="600px"
                  style={{ border: 'none', borderRadius: '8px' }}
                />
              )}
            </div>
            <div className={styles.modalFooter}>
              <a href={previewUrl} download target="_blank" rel="noreferrer">
                <button className={styles.btnSave}>
                  <span className="material-symbols-outlined">download</span>
                  Download File
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
      {niksToDelete.length > 0 && (
        <div className={styles.modalOverlay} onClick={() => setNiksToDelete([])}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ background: '#fff5f5', borderBottom: '1px solid #fee2e2' }}>
              <div className={styles.modalTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>warning</span>
                <h3 className={styles.modalTitle} style={{ color: '#991b1b', margin: 0 }}>
                  Konfirmasi Hapus
                </h3>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setNiksToDelete([])}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modalBody} style={{ padding: '24px 32px', textAlign: 'center', overflow: 'hidden' }}>
              <p style={{ fontSize: '15px', color: '#374151', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin menghapus <strong>{niksToDelete.length}</strong> data ini?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  className={styles.modalCloseBtn}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    borderRadius: '9999px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flex: 1
                  }}
                  onClick={() => setNiksToDelete([])}
                >
                  Tidak
                </button>
                <button
                  className={styles.modalCloseBtn}
                  style={{
                    backgroundColor: '#dc2626',
                    border: 'none',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flex: 1
                  }}
                  onClick={() => {
                    if (onDelete && niksToDelete.length > 0) {
                      onDelete(niksToDelete);
                      setSelectedNiks((prev) => prev.filter((n) => !niksToDelete.includes(n)));
                      setNiksToDelete([]);
                      setIsSelecting(false);
                    }
                  }}
                >
                  Yakin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
