import React from 'react';
import styles from './HalamanSelesai.module.css';

interface HalamanSelesaiProps {
  onReturnToDashboard: () => void;
  onFillOtherData: () => void;
}

export default function HalamanSelesai({
  onReturnToDashboard,
  onFillOtherData,
}: HalamanSelesaiProps) {
  // Generate a random Reference ID for demo verification authenticity
  const refId = 'BOY-2026-X992-K01';

  return (
    <div className={styles.canvas} id="success-screen-container">
      {/* Left Bento-ish informative details card panel */}
      <div className={styles.leftPanel}>
        <div>
          <h3 className={styles.leftHeaderTitle}>Input Data</h3>
          <p className={styles.leftHeaderSubtitle}>
            Formulir Pendataan Penerima Bantuan Kesejahteraan Kabupaten Boyolali
          </p>

          {/* Checked highlights column */}
          <div className={styles.checkList}>
            <div className={styles.checkItem}>
              <span className={styles.checkIcon}>check_circle</span>
              <span>Data Identitas</span>
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIcon}>check_circle</span>
              <span>Verifikasi Alamat</span>
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIcon}>check_circle</span>
              <span>Upload Dokumen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Canvas / Main Success message area */}
      <div className={styles.rightPanel}>
        {/* Animated Checkmark badge icon */}
        <div className={styles.successIconBadge}>
          <div className={styles.glowBg} />
          <div className={styles.successCircle}>
            <span className={`${styles.successCheckIcon} material-symbols-outlined`}>check_circle</span>
          </div>
        </div>

        {/* Success Header details */}
        <h2 className={styles.successTitle}>Data Berhasil Disimpan!</h2>
        <p className={styles.successDesc}>
          Terima kasih, dokumen Anda telah berhasil diunggah dan sedang dalam proses verifikasi.
          Pihak Sekretariat Kabupaten akan segera meninjau permohonan Anda.
        </p>

        {/* Waiting Verification badge */}
        <div className={styles.statusIndicator}>
          <span className={`${styles.statusIcon} material-symbols-outlined`}>verified</span>
          <span>Status: Menunggu Verifikasi</span>
        </div>

        {/* Action Triggers row */}
        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.btnDashboard}
            onClick={onReturnToDashboard}
            id="btn-return-success"
          >
            <span className={styles.btnDashboardIcon}>arrow_back</span>
            <span>Kembali ke Dashboard</span>
          </button>

          <button
            type="button"
            className={styles.btnOther}
            onClick={onFillOtherData}
            id="btn-other-fill"
          >
            <span>Isi Data Lainnya</span>
            <span className={styles.btnOtherIcon}>arrow_forward</span>
          </button>
        </div>

        {/* Reference identity details footer */}
        <div className={styles.metaRef}>
          Ref ID: {refId}
        </div>
      </div>
    </div>
  );
}
