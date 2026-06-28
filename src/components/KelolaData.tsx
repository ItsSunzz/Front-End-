import React, { useState } from 'react';
import styles from './KelolaData.module.css';
import { Recipient, UserSession } from '../types';
import * as XLSX from 'xlsx';

interface KelolaDataProps {
  recipients?: Recipient[];
  userSession?: UserSession;
  onDelete?: (niks: string[]) => void;
  onUpdate?: (updatedRec: Recipient) => void;
}

export default function KelolaData({
  recipients = [],
  userSession,
  onDelete,
  onUpdate,
}: KelolaDataProps) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('');

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNiks, setSelectedNiks] = useState<string[]>([]);

  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Recipient>>({});

  // Filter recipients by logged-in district and search input
  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.nama.toLowerCase().includes(search.toLowerCase()) ||
      recipient.nik.includes(search);
    const matchesKategori = filterKategori === 'Semua' || recipient.kategori === filterKategori;

    // Filter strictly by the current Kecamatan's session (must match)
    const matchesKecamatan = recipient.kecamatan === userSession?.kecamatan;

    return matchesSearch && matchesKategori && matchesKecamatan;
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
    if (onDelete && selectedNiks.length > 0) {
      if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedNiks.length} data terpilih?`)) {
        onDelete(selectedNiks);
        setSelectedNiks([]);
        setIsSelecting(false);
      }
    }
  };

  const handleDeleteSingle = (nik: string) => {
    if (onDelete) {
      if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        onDelete([nik]);
        setSelectedNiks(prev => prev.filter(n => n !== nik));
      }
    }
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
  };

  const handleSaveEdit = () => {
    if (selectedRecipient && onUpdate) {
      onUpdate({ ...selectedRecipient, ...editFormData } as Recipient);
      setSelectedRecipient(null);
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
                {isSelecting ? 'Batal Pilih' : 'Pilih Multiple'}
              </button>

              {isSelecting && selectedNiks.length > 0 && (
                <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={handleDeleteSelected}>
                  <span className="material-symbols-outlined">delete</span>
                  Hapus ({selectedNiks.length})
                </button>
              )}

              <button className={`${styles.actionBtn} ${styles.btnExport}`} onClick={handleExport}>
                <span className="material-symbols-outlined">download</span>
                Export Excel
              </button>
            </div>

            <div className={styles.rightFilters}>
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
                        <button
                          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-emerald-200 transition-colors"
                          onClick={() => handleRowClick(rec)}
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-rose-200 transition-colors"
                          onClick={() => handleDeleteSingle(rec.nik)}
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Hapus</span>
                        </button>
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
        <div className={styles.modalOverlay} onClick={() => setSelectedRecipient(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Rincian & Edit Data Penerima</h2>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedRecipient(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
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
                <div className={styles.detailGroup}>
                  <label>Kategori</label>
                  {isEditing ? (
                    <select
                      value={editFormData.kategori || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, kategori: e.target.value })}
                      className={styles.editInput}
                    >
                      <option value="Guru Mengaji">Guru Mengaji</option>
                      <option value="Pimpinan Pondok">Pimpinan Pondok</option>
                    </select>
                  ) : (
                    <p>{selectedRecipient.kategori}</p>
                  )}
                </div>

                {/* Desa/Kelurahan */}
                <div className={styles.detailGroup}>
                  <label>Desa/Kelurahan</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.desaKelurahan || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, desaKelurahan: e.target.value })}
                      className={styles.editInput}
                    />
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
                <div className={styles.detailGroup}>
                  <label>Bank Operasional</label>
                  {isEditing ? (
                    <select
                      value={editFormData.bank || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bank: e.target.value })}
                      className={styles.editInput}
                    >
                      <option value="Bank Jateng">Bank Jateng (Cab. Boyolali)</option>
                      <option value="Bank Boyolali">Bank Boyolali</option>
                      <option value="Bank BKK">Bank BKK Boyolali</option>
                    </select>
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
                    Object.entries(selectedRecipient.dokumenUploaded).map(([key, url]) =>
                      url ? (
                        <div key={key} className={styles.docItem}>
                          <span className="material-symbols-outlined text-emerald-600">description</span>
                          <span>{key.toUpperCase()}</span>
                          <button
                            className={styles.viewDocBtn}
                            onClick={() => {
                              setPreviewUrl(url as string);
                              setPreviewLabel(key.toUpperCase());
                            }}
                          >
                            Lihat File
                          </button>
                        </div>
                      ) : null
                    )
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
    </div>
  );
}
