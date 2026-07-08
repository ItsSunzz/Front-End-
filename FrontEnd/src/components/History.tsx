import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './History.module.css';
import { Recipient } from '../types';


interface HistoryProps {
    recipients: Recipient[];
}

function formatTanggalInput(tahun: string): string {
    if (!tahun) return '-';
    if (/^\d{4}$/.test(tahun)) return `01/01/${tahun}`;
    const d = new Date(tahun);
    if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return tahun;
}

export default function History({ recipients }: HistoryProps) {
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterTahun, setFilterTahun] = useState('Semua');
    const [dropdownKategori, setDropdownKategori] = useState(false);
    const [dropdownStatus, setDropdownStatus] = useState(false);
    const [dropdownTahun, setDropdownTahun] = useState(false);

    // ── refs untuk detect klik di luar dropdown ──
    const wrapperKategoriRef = useRef<HTMLDivElement>(null);
    const wrapperStatusRef = useRef<HTMLDivElement>(null);
    const wrapperTahunRef = useRef<HTMLDivElement>(null);

    // ── close dropdown kalau klik di luar ──
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperKategoriRef.current && !wrapperKategoriRef.current.contains(e.target as Node)) {
                setDropdownKategori(false);
            }
            if (wrapperStatusRef.current && !wrapperStatusRef.current.contains(e.target as Node)) {
                setDropdownStatus(false);
            }
            if (wrapperTahunRef.current && !wrapperTahunRef.current.contains(e.target as Node)) {
                setDropdownTahun(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const kategoriList = ['Semua', ...Array.from(new Set(recipients.map(r => r.kategori).filter(Boolean)))];
    const statusList = ['Semua', 'Terverifikasi', 'Pending', 'Ditolak'];
    const tahunList = ['Semua', ...Array.from(new Set(recipients.map(r => r.tahun).filter(Boolean))).sort()];

    const filtered = useMemo(() => {
        const list = recipients.filter(r => {
            const matchSearch =
                r.nama.toLowerCase().includes(search.toLowerCase()) ||
                r.nik.toLowerCase().includes(search.toLowerCase());
            const matchKategori = filterKategori === 'Semua' || r.kategori === filterKategori;
            const matchStatus = filterStatus === 'Semua' || r.status === filterStatus;
            const matchTahun = filterTahun === 'Semua' || r.tahun === filterTahun;
            return matchSearch && matchKategori && matchStatus && matchTahun;
        });

        return list.sort((a, b) => {
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
    }, [recipients, search, filterKategori, filterStatus, filterTahun]);

    const getStatusBadge = (status: string) => {
        if (status === 'Terverifikasi') return styles.badgeActive;
        if (status === 'Pending') return styles.badgePending;
        if (status === 'Ditolak') return styles.badgeDitolak;
        return '';
    };

    const getStatusDot = (status: string) => {
        if (status === 'Terverifikasi') return '●';
        if (status === 'Pending') return '◐';
        if (status === 'Ditolak') return '✕';
        return '';
    };

    return (
        <div className={styles.container}>
            {/* Page Title */}
            <div className={styles.pageHeader}>
                <div className={styles.pageTitleGroup}>
                    <span className={`${styles.pageTitleIcon} material-symbols-outlined`}>history</span>
                    <div>
                        <h2 className={styles.pageTitle}>Riwayat Data</h2>
                        <p className={styles.pageSubtitle}>Log seluruh data penerima yang telah diinput ke sistem</p>
                    </div>
                </div>
                <div className={styles.totalBadge}>
                    <span>{recipients.length} Total Data</span>
                </div>
            </div>

            {/* Table Card */}
            <div className={styles.tableContainer}>
                {/* Filter Header */}
                <div className={styles.filterHeader}>
                    {/* Search */}
                    <div className={styles.searchBox}>
                        <span className={`${styles.searchIcon} material-symbols-outlined`}>search</span>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Cari nama atau NIK..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Right Controls */}
                    <div className={styles.rightControls}>
                        {/* Filter Periode */}
                        <div className={styles.customSelectWrapper} ref={wrapperTahunRef}>
                            <div
                                className={`${styles.customSelect} ${dropdownTahun ? styles.inputFocused : ''}`}
                                onClick={() => { setDropdownTahun(!dropdownTahun); setDropdownKategori(false); setDropdownStatus(false); }}
                            >
                                <span className={styles.selectLabel}>{filterTahun === 'Semua' ? 'Semua Tahun Anggaran' : `Tahun ${filterTahun}`}</span>
                                <span className={`${styles.arrowIcon} material-symbols-outlined ${dropdownTahun ? styles.arrowUp : ''}`}>
                                    expand_more
                                </span>
                            </div>
                            {dropdownTahun && (
                                <div className={styles.dropdownMenu}>
                                    {tahunList.map(t => (
                                        <div
                                            key={t}
                                            className={`${styles.dropdownItem} ${filterTahun === t ? styles.dropdownItemSelected : ''}`}
                                            onClick={() => { setFilterTahun(t); setDropdownTahun(false); }}
                                        >
                                            {t === 'Semua' ? 'Semua Tahun Anggaran' : `Tahun ${t}`}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Kategori */}
                        <div className={styles.customSelectWrapper} ref={wrapperKategoriRef}>
                            <div
                                className={`${styles.customSelect} ${dropdownKategori ? styles.inputFocused : ''}`}
                                onClick={() => { setDropdownKategori(!dropdownKategori); setDropdownStatus(false); }}
                            >
                                <span className={styles.selectLabel}>{filterKategori === 'Semua' ? 'Semua Kategori' : filterKategori}</span>
                                <span className={`${styles.arrowIcon} material-symbols-outlined ${dropdownKategori ? styles.arrowUp : ''}`}>
                                    expand_more
                                </span>
                            </div>
                            {dropdownKategori && (
                                <div className={styles.dropdownMenu}>
                                    {kategoriList.map(k => (
                                        <div
                                            key={k}
                                            className={`${styles.dropdownItem} ${filterKategori === k ? styles.dropdownItemSelected : ''}`}
                                            onClick={() => { setFilterKategori(k); setDropdownKategori(false); }}
                                        >
                                            {k === 'Semua' ? 'Semua Kategori' : k}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Status */}
                        <div className={styles.customSelectWrapper} ref={wrapperStatusRef}>
                            <div
                                className={`${styles.customSelect} ${dropdownStatus ? styles.inputFocused : ''}`}
                                onClick={() => { setDropdownStatus(!dropdownStatus); setDropdownKategori(false); }}
                            >
                                <span className={styles.selectLabel}>{filterStatus === 'Semua' ? 'Semua Status' : filterStatus}</span>
                                <span className={`${styles.arrowIcon} material-symbols-outlined ${dropdownStatus ? styles.arrowUp : ''}`}>
                                    expand_more
                                </span>
                            </div>
                            {dropdownStatus && (
                                <div className={styles.dropdownMenu}>
                                    {statusList.map(s => (
                                        <div
                                            key={s}
                                            className={`${styles.dropdownItem} ${filterStatus === s ? styles.dropdownItemSelected : ''}`}
                                            onClick={() => { setFilterStatus(s); setDropdownStatus(false); }}
                                        >
                                            {s === 'Semua' ? 'Semua Status' : s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Table */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>No</th>
                                <th className={styles.th}>Nama</th>
                                <th className={styles.th}>Kategori</th>
                                <th className={styles.th}>Tanggal Input</th>
                                <th className={styles.th}>Masa Periode</th>
                                <th className={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className={styles.emptyState}>
                                            <span className={`${styles.emptyIcon} material-symbols-outlined`}>manage_search</span>
                                            <p>Tidak ada data yang cocok dengan filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r, idx) => {
                                    const masaJabatan =
                                        (r as any).masaJabatanMulai && (r as any).masaJabatanSelesai
                                            ? `${(r as any).masaJabatanMulai} – ${(r as any).masaJabatanSelesai}`
                                            : r.tahun
                                                ? `${r.tahun} – -`
                                                : '-';

                                    const tanggalInput = (r as any).tanggalInput
                                        ? formatTanggalInput((r as any).tanggalInput)
                                        : r.tahun
                                            ? `01/01/${r.tahun}`
                                            : '-';

                                    return (
                                        <tr key={idx} className={styles.tr}>
                                            <td className={styles.td}>
                                                <span className={styles.noIndex}>{idx + 1}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.recipientName}>{r.nama}</span>
                                                <div className={styles.nikText}>{r.nik}</div>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.kategoriTag}>{r.kategori}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.tanggalCell}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#717972' }}>calendar_today</span>
                                                    {tanggalInput}
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.masaJabatanPill}>{masaJabatan}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.badge} ${getStatusBadge(r.status)}`}>
                                                    <span>{getStatusDot(r.status)}</span>
                                                    <span>{r.status}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer info */}
                {filtered.length > 0 && (
                    <div className={styles.tableFooter}>
                        Menampilkan <strong>{filtered.length}</strong> dari <strong>{recipients.length}</strong> data
                    </div>
                )}
            </div>
        </div>
    );
}