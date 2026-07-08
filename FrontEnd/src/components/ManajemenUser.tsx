import React, { useState } from 'react';
import styles from './ManajemenUser.module.css';
import { Recipient, UserSession } from '../types';
import * as XLSX from 'xlsx';
import { desaByKecamatan } from '../constants';

interface ManajemenUserProps {
    recipients?: Recipient[];
    userSession?: UserSession;
    onDelete?: (niks: string[]) => void;
    onUpdate?: (updatedRec: Recipient) => void;
}

export default function ManajemenUser({ recipients = [], userSession, onDelete, onUpdate }: ManajemenUserProps) {
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterTahun, setFilterTahun] = useState('Semua');
    const [filterKecamatan, setFilterKecamatan] = useState('Semua');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Get unique years dynamically from recipients
    const tahunOptions = ['Semua', ...Array.from(new Set(recipients.map((r) => r.tahun).filter(Boolean))).sort()];

    // Get kecamatan options from constants
    const kecamatanOptions = ['Semua', ...Object.keys(desaByKecamatan).sort()];

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLabel, setPreviewLabel] = useState<string>('');

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedNiks, setSelectedNiks] = useState<string[]>([]);
    const [niksToDelete, setNiksToDelete] = useState<string[]>([]);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Recipient>>({});

    const filteredRecipients = recipients.filter((recipient) => {
        const matchesSearch =
            recipient.nama.toLowerCase().includes(search.toLowerCase()) ||
            recipient.nik.includes(search);
        const matchesKategori = filterKategori === 'Semua' || recipient.kategori === filterKategori;
        const matchesStatus = filterStatus === 'Semua' || recipient.status === filterStatus;
        const matchesTahun = filterTahun === 'Semua' || recipient.tahun === filterTahun;
        const matchesKecamatan = filterKecamatan === 'Semua' || recipient.kecamatan === filterKecamatan;
        return matchesSearch && matchesKategori && matchesStatus && matchesTahun && matchesKecamatan;
    });

    const sortedRecipients = [...filteredRecipients].sort((a, b) => {
        if (!a.updatedAt) return 1;
        if (!b.updatedAt) return -1;
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return timeB - timeA;
    });

    const pendingCount = recipients.filter(r => r.status === 'Pending').length;

    const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedNiks(filteredRecipients.map((r) => r.nik));
        } else {
            setSelectedNiks([]);
        }
    };

    const handleToggleSelect = (nik: string) => {
        setSelectedNiks((prev) =>
            prev.includes(nik) ? prev.filter((n) => n !== nik) : [...prev, nik]
        );
    };

    const handleDelete = () => {
        if (selectedNiks.length > 0) {
            setNiksToDelete(selectedNiks);
        }
    };

    const handleExport = () => {
        if (selectedNiks.length === 0) return;
        const dataToExport = recipients
            .filter((r) => selectedNiks.includes(r.nik))
            .map((r, index) => ({
                No: index + 1,
                'Nama Lengkap': r.nama,
                NIK: r.nik,
                Kategori: r.kategori,
                Kecamatan: r.kecamatan,
                'Desa/Kelurahan': r.desaKelurahan,
                Bank: r.bank,
                Tahun: r.tahun,
                Status: r.status,
            }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penerima');
        XLSX.writeFile(workbook, 'Data_Penerima_Bansos.xlsx');
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

    const handleVerifikasi = (rec: Recipient, newStatus: 'Terverifikasi' | 'Ditolak') => {
        if (onUpdate) {
            onUpdate({ ...rec, status: newStatus });
            setSelectedRecipient(null);
        }
    };

    return (
        <div className={styles.container} onClick={() => setOpenDropdown(null)}>

            {/* Pending banner */}
            {pendingCount > 0 && (
                <div className={styles.pendingBanner}>
                    <span className={`material-symbols-outlined ${styles.bannerIcon}`}>pending_actions</span>
                    <span>
                        Terdapat <strong>{pendingCount} pengajuan</strong> yang menunggu verifikasi.
                    </span>
                    <button
                        className={styles.bannerBtn}
                        onClick={() => setFilterStatus('Pending')}
                    >
                        Tinjau Sekarang
                    </button>
                </div>
            )}

            <div className={styles.tableContainer}>

                {/* Filter Header */}
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
                                    <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={handleDelete}>
                                        <span className="material-symbols-outlined">delete</span>
                                        Hapus ({selectedNiks.length})
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.btnExport}`} onClick={handleExport}>
                                        <span className="material-symbols-outlined">download</span>
                                        Export .xlsx
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
                                    <span className={styles.selectLabel}>{filterTahun === 'Semua' ? 'Semua Tahun Anggaran' : `Tahun ${filterTahun}`}</span>
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
                                                {opt === 'Semua' ? 'Semua Tahun Anggaran' : `Tahun ${opt}`}
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
                                    <span className={styles.selectLabel}>{filterKategori === 'Semua' ? 'Semua Kategori' : filterKategori}</span>
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

                            {/* Filter Kecamatan */}
                            <div
                                className={styles.customSelectWrapper}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(openDropdown === 'filter-kecamatan' ? null : 'filter-kecamatan');
                                }}
                            >
                                <div className={`${styles.customSelect} ${openDropdown === 'filter-kecamatan' ? styles.inputFocused : ''}`}>
                                    <span className={styles.selectLabel}>{filterKecamatan === 'Semua' ? 'Semua Kecamatan' : filterKecamatan}</span>
                                    <span className={`${styles.arrowIcon} ${openDropdown === 'filter-kecamatan' ? styles.arrowUp : ''}`}>
                                        expand_more
                                    </span>
                                </div>
                                {openDropdown === 'filter-kecamatan' && (
                                    <div className={styles.dropdownMenu}>
                                        {kecamatanOptions.map((opt) => (
                                            <div
                                                key={opt}
                                                className={`${styles.dropdownItem} ${filterKecamatan === opt ? styles.dropdownItemSelected : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFilterKecamatan(opt);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                {opt === 'Semua' ? 'Semua Kecamatan' : opt}
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
                                    <span className={styles.selectLabel}>{filterStatus === 'Semua' ? 'Semua Status' : filterStatus}</span>
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
                                                {opt === 'Semua' ? 'Semua Status' : opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Tabel Data */}
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
                                                    selectedNiks.length === filteredRecipients.length &&
                                                    filteredRecipients.length > 0
                                                }
                                            />
                                        </th>
                                    )}
                                    <th className={styles.th}>No</th>
                                    <th className={styles.th}>Nama Lengkap</th>
                                    <th className={styles.th}>NIK</th>
                                    <th className={styles.th}>Kategori</th>
                                    <th className={styles.th}>Kecamatan</th>
                                    <th className={styles.th}>Bank Operasional</th>
                                    <th className={styles.th}>Status Berkas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRecipients.map((rec, index) => (
                                    <tr
                                        key={index}
                                        className={`${styles.tr} ${styles.clickableRow}`}
                                        onClick={() => !isSelecting && handleRowClick(rec)}
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
                                        <td className={styles.td}>{rec.kecamatan}</td>
                                        <td className={styles.td}>{rec.bank}</td>
                                        <td className={styles.td}>
                                            <span
                                                className={`${styles.badge} ${rec.status === 'Terverifikasi'
                                                    ? styles.badgeActive
                                                    : rec.status === 'Pending'
                                                        ? styles.badgePending
                                                        : styles.badgeDitolak
                                                    }`}
                                            >
                                                <span className={styles.badgeText}>{rec.status}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>search_off</span>
                            <p>Tidak ada data yang cocok dengan filter yang dipilih.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL + VERIFIKASI + EDIT */}
            {selectedRecipient && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRecipient(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleGroup}>
                                <h2 className={styles.modalTitle}>Rincian Data Penerima</h2>
                                <span
                                    className={`${styles.badge} ${selectedRecipient.status === 'Terverifikasi'
                                        ? styles.badgeActive
                                        : selectedRecipient.status === 'Pending'
                                            ? styles.badgePending
                                            : styles.badgeDitolak
                                        }`}
                                >
                                    <span className={styles.badgeText}>{selectedRecipient.status}</span>
                                </span>
                            </div>
                            <button className={styles.modalCloseBtn} onClick={() => setSelectedRecipient(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Data Fields */}
                            <div className={styles.detailGrid}>
                                <div className={styles.detailGroup}>
                                    <label>Nama Lengkap</label>
                                    <p>{selectedRecipient.nama}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>NIK</label>
                                    <p>{selectedRecipient.nik}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Kategori</label>
                                    <p>{selectedRecipient.kategori}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Kecamatan</label>
                                    <p>{selectedRecipient.kecamatan}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Nomor Rekening</label>
                                    <p>{selectedRecipient.noRekening || '-'}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Bank Operasional</label>
                                    <p>{selectedRecipient.bank || '-'}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Masa Periode</label>
                                    <p>{selectedRecipient.masaJabatanMulai || '-'}</p>
                                </div>

                                <div className={styles.detailGroup}>
                                    <label>Masa Berakhir Periode</label>
                                    <p>{selectedRecipient.masaJabatanSelesai || '-'}</p>
                                </div>
                            </div>

                            {/* Dokumen */}
                            <div className={styles.docSection}>
                                <h3 className={styles.docTitle}>Dokumen Terlampir</h3>
                                <div className={styles.docList}>
                                    {selectedRecipient.dokumenUploaded ? (
                                        Object.entries(selectedRecipient.dokumenUploaded).map(([key, url]) =>
                                            url ? (
                                                <div key={key} className={styles.docItem}>
                                                    <span className="material-symbols-outlined" style={{ color: '#007432' }}>description</span>
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

                            {/* Aksi Verifikasi — hanya tampil jika status Pending */}
                            {selectedRecipient.status === 'Pending' && (
                                <div className={styles.verifikasiSection}>
                                    <h3 className={styles.docTitle}>Keputusan Verifikasi</h3>
                                    <p className={styles.verifikasiNote}>
                                        Tinjau data dan dokumen di atas sebelum memberikan keputusan.
                                    </p>
                                    <div className={styles.verifikasiActions}>
                                        <button
                                            className={styles.btnReject}
                                            onClick={() => setIsRejecting(true)}
                                        >
                                            <span className="material-symbols-outlined">cancel</span>
                                            Tolak Pengajuan
                                        </button>
                                        <button
                                            className={styles.btnApprove}
                                            onClick={() => handleVerifikasi(selectedRecipient, 'Terverifikasi')}
                                        >
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Setujui & Verifikasi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setSelectedRecipient(null)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PREVIEW DOKUMEN */}
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
                            {previewUrl.match(/\.(jpg|jpeg|png|blob)$/i) || previewUrl.startsWith('blob:') ? (
                                <img
                                    src={previewUrl}
                                    alt={previewLabel}
                                    style={{ width: '100%', height: 'auto', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }}
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
            {isRejecting && selectedRecipient && (
                <div className={styles.modalOverlay} onClick={() => { setIsRejecting(false); setRejectionReason(''); }}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader} style={{ background: '#fff5f5', borderBottom: '1px solid #fee2e2' }}>
                            <div className={styles.modalTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>warning</span>
                                <h3 className={styles.modalTitle} style={{ color: '#991b1b', margin: 0 }}>
                                    Alasan Penolakan
                                </h3>
                            </div>
                            <button className={styles.modalCloseBtn} onClick={() => { setIsRejecting(false); setRejectionReason(''); }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '24px 32px' }}>
                            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                                Silakan masukkan catatan/alasan penolakan untuk pengajuan <strong>{selectedRecipient.nama}</strong>:
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Contoh: Dokumen KTP tidak terbaca / buram"
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #c1c8c0',
                                    outline: 'none',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                    resize: 'none',
                                    marginBottom: '20px'
                                }}
                            />
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
                                    onClick={() => { setIsRejecting(false); setRejectionReason(''); }}
                                >
                                    Batal
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
                                    disabled={!rejectionReason.trim()}
                                    onClick={() => {
                                        if (onUpdate && selectedRecipient) {
                                            onUpdate({ ...selectedRecipient, status: 'Ditolak', catatan: rejectionReason });
                                            setSelectedRecipient(null);
                                            setIsRejecting(false);
                                            setRejectionReason('');
                                        }
                                    }}
                                >
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}