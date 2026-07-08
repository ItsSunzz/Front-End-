import React, { useState, useRef } from 'react';
import styles from './FormDokumen.module.css';
import { FormData } from '../types';

interface FormDokumenProps {
  data: FormData;
  onChange: (fields: Partial<FormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export default function FormDokumen({
  data,
  onChange,
  onSubmit,
  onBack,
  onSaveDraft,
}: FormDokumenProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocKey, setActiveDocKey] = useState<keyof typeof data.dokumenUploaded | null>(null);

  const triggerFileInput = (docKey: keyof typeof data.dokumenUploaded) => {
    if (data.dokumenUploaded[docKey]) {
      // If already uploaded, clicking the button deletes it
      onChange({
        dokumenUploaded: {
          ...data.dokumenUploaded,
          [docKey]: null,
        },
      });
    } else {
      // If not uploaded, open file selector
      setActiveDocKey(docKey);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeDocKey) {
      const file = e.target.files[0];
      const maxSizeBytes = 1 * 1024 * 1024; // 1 MB
      if (file.size > maxSizeBytes) {
        alert(`⚠️ Ukuran file "${file.name}" melebihi 1MB. Silakan upload file yang lebih kecil.`);
        setErrorLocal(`Ukuran file "${file.name}" melebihi 1MB. Silakan upload file yang lebih kecil.`);
        setActiveDocKey(null);
        e.target.value = '';
        return;
      }
      handleUploadSimulate(activeDocKey, file); // ✅ kirim file-nya
    }
    e.target.value = '';
  };

  const handleUploadSimulate = (docKey: keyof typeof data.dokumenUploaded, file?: File) => {
    setUploadingDoc(docKey);
    setErrorLocal('');

    setTimeout(() => {
      onChange({
        dokumenUploaded: {
          ...data.dokumenUploaded,
          [docKey]: file || null,
        },
      });
      setUploadingDoc(null);
      setActiveDocKey(null);
    }, 600);
  };

  const validateAndSubmit = () => {
    if (
      !data.dokumenUploaded.ktp ||
      !data.dokumenUploaded.kk ||
      !data.dokumenUploaded.suratPutusan ||
      !data.dokumenUploaded.suratKeterangan ||
      !data.dokumenUploaded.suratPimpinanPondok ||
      !data.masaJabatanMulai.trim() ||
      !data.masaJabatanSelesai.trim()
    ) {
      setErrorLocal('Mohon lengkapi seluruh dokumen pendukung (KTP, KK, Surat Putusan, Surat Keterangan, Surat Pimpinan/Guru) dan Masa Periode sebelum submit.');
      return;
    }

    const startYear = parseInt(data.masaJabatanMulai);
    const endYear = parseInt(data.masaJabatanSelesai);
    if (isNaN(startYear) || isNaN(endYear) || startYear > endYear || startYear < 2000 || endYear > 2099) {
      setErrorLocal('Masa periode tidak valid. Tahun berakhir harus setelah atau sama dengan tahun berlaku.');
      return;
    }

    setErrorLocal('');
    onSubmit();
  };

  return (
    <div id="step-3-dokumen" className="space-y-6">
      {/* progress Stepper Progress Bar */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperTrack}>
          <div className={styles.lineBg} />
          <div className={styles.lineProgress} style={{ width: '100%' }} />

          {/* Step 1 (Completed) */}
          <div className={styles.stepNode} onClick={onBack} style={{ cursor: 'pointer' }}>
            <div className={`${styles.stepCircle} ${styles.completedCircle}`}>
              <span className={styles.checkMark}>check</span>
            </div>
            <span className={styles.stepLabel}>Identitas Diri</span>
          </div>

          {/* Step 2 (Completed) */}
          <div className={styles.stepNode} onClick={onBack} style={{ cursor: 'pointer' }}>
            <div className={`${styles.stepCircle} ${styles.completedCircle}`}>
              <span className={styles.checkMark}>check</span>
            </div>
            <span className={styles.stepLabel}>Rekening</span>
          </div>

          {/* Step 3 */}
          <div className={styles.stepNode}>
            <div className={`${styles.stepCircle} ${styles.activeCircle}`}>3</div>
            <span className={`${styles.stepLabel} ${styles.activeLabel}`}>Dokumen</span>
          </div>
        </div>
      </div>

      {/* Main card details container */}
      <div className={styles.formCard}>
        {/* Support Header Bar */}
        <div className={styles.alertHeader}>
          <div className={styles.alertIconContainer}>
            <span className={`${styles.alertIcon} material-symbols-outlined`}>cloud_upload</span>
          </div>
          <div>
            <h3 className={styles.alertTitle}>Upload Dokumen Pendukung</h3>
            <p className={styles.alertSubtitle}>
              Upload semua dokumen yang diperlukan dalam format JPG/PNG/PDF (Maks. 1MB)
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: 'none' }}
          />
          <div className={styles.grid}>

            {/* Card 1: KTP */}
            <div className={`${styles.uploadCard} ${data.dokumenUploaded.ktp ? styles.cardActive : ''}`}>
              {data.dokumenUploaded.ktp && (
                <span className={`${styles.successIndicator} material-symbols-outlined`}>check_circle</span>
              )}
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>badge</span>
              </div>
              <h4 className={styles.docTitle}>KTP</h4>
              <p className={styles.docDesc}>Kartu Tanda Penduduk asli</p>

              <button
                type="button"
                className={`${styles.btnUpload} ${data.dokumenUploaded.ktp ? styles.btnSuccess : ''}`}
                onClick={() => triggerFileInput('ktp')}
                disabled={uploadingDoc === 'ktp'}
              >
                <span className={styles.uploadIcon}>
                  {uploadingDoc === 'ktp' ? 'sync' : 'upload'}
                </span>
                <span>
                  {uploadingDoc === 'ktp'
                    ? 'Mengunggah...'
                    : data.dokumenUploaded.ktp
                      ? 'Batal / Hapus'
                      : 'Upload'}
                </span>
              </button>
            </div>

            {/* Card 2: Kartu Keluarga */}
            <div className={`${styles.uploadCard} ${data.dokumenUploaded.kk ? styles.cardActive : ''}`}>
              {data.dokumenUploaded.kk && (
                <span className={`${styles.successIndicator} material-symbols-outlined`}>check_circle</span>
              )}
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>diversity_3</span>
              </div>
              <h4 className={styles.docTitle}>Kartu Keluarga</h4>
              <p className={styles.docDesc}>Scan KK yang masih berlaku</p>

              <button
                type="button"
                className={`${styles.btnUpload} ${data.dokumenUploaded.kk ? styles.btnSuccess : ''}`}
                onClick={() => triggerFileInput('kk')}
                disabled={uploadingDoc === 'kk'}
              >
                <span className={styles.uploadIcon}>
                  {uploadingDoc === 'kk' ? 'sync' : 'upload'}
                </span>
                <span>
                  {uploadingDoc === 'kk'
                    ? 'Mengunggah...'
                    : data.dokumenUploaded.kk
                      ? 'Batal / Hapus'
                      : 'Upload'}
                </span>
              </button>
            </div>

            {/* Card 3: Surat Putusan */}
            <div className={`${styles.uploadCard} ${data.dokumenUploaded.suratPutusan ? styles.cardActive : ''}`}>
              {data.dokumenUploaded.suratPutusan && (
                <span className={`${styles.successIndicator} material-symbols-outlined`}>check_circle</span>
              )}
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>gavel</span>
              </div>
              <h4 className={styles.docTitle}>Surat Putusan</h4>
              <p className={styles.docDesc}>Dari Kecamatan setempat</p>

              <button
                type="button"
                className={`${styles.btnUpload} ${data.dokumenUploaded.suratPutusan ? styles.btnSuccess : ''}`}
                onClick={() => triggerFileInput('suratPutusan')}
                disabled={uploadingDoc === 'suratPutusan'}
              >
                <span className={styles.uploadIcon}>
                  {uploadingDoc === 'suratPutusan' ? 'sync' : 'upload'}
                </span>
                <span>
                  {uploadingDoc === 'suratPutusan'
                    ? 'Mengunggah...'
                    : data.dokumenUploaded.suratPutusan
                      ? 'Batal / Hapus'
                      : 'Upload'}
                </span>
              </button>
            </div>

            {/* Card 4: Surat Keterangan */}
            <div className={`${styles.uploadCard} ${data.dokumenUploaded.suratKeterangan ? styles.cardActive : ''}`}>
              {data.dokumenUploaded.suratKeterangan && (
                <span className={`${styles.successIndicator} material-symbols-outlined`}>check_circle</span>
              )}
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>article</span>
              </div>
              <h4 className={styles.docTitle}>Surat Keterangan</h4>
              <p className={styles.docDesc}>Dari Kecamatan setempat</p>

              <button
                type="button"
                className={`${styles.btnUpload} ${data.dokumenUploaded.suratKeterangan ? styles.btnSuccess : ''}`}
                onClick={() => triggerFileInput('suratKeterangan')}
                disabled={uploadingDoc === 'suratKeterangan'}
              >
                <span className={styles.uploadIcon}>
                  {uploadingDoc === 'suratKeterangan' ? 'sync' : 'upload'}
                </span>
                <span>
                  {uploadingDoc === 'suratKeterangan'
                    ? 'Mengunggah...'
                    : data.dokumenUploaded.suratKeterangan
                      ? 'Batal / Hapus'
                      : 'Upload'}
                </span>
              </button>
            </div>

            {/* Card 5: Surat Pimpinan Pondok atau Guru Mengaji */}
            <div className={`${styles.uploadCard} ${data.dokumenUploaded.suratPimpinanPondok ? styles.cardActive : ''}`}>
              {data.dokumenUploaded.suratPimpinanPondok && (
                <span className={`${styles.successIndicator} material-symbols-outlined`}>check_circle</span>
              )}
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>school</span>
              </div>
              <h4 className={styles.docTitle}>Surat Pimpinan / Guru</h4>
              <p className={styles.docDesc}>Pimpinan Pondok atau Guru Mengaji</p>   {/* ✅ Perbaikan di sini */}

              <button
                type="button"
                className={`${styles.btnUpload} ${data.dokumenUploaded.suratPimpinanPondok ? styles.btnSuccess : ''}`}
                onClick={() => triggerFileInput('suratPimpinanPondok')}
                disabled={uploadingDoc === 'suratPimpinanPondok'}
              >
                <span className={styles.uploadIcon}>
                  {uploadingDoc === 'suratPimpinanPondok' ? 'sync' : 'upload'}
                </span>
                <span>
                  {uploadingDoc === 'suratPimpinanPondok'
                    ? 'Mengunggah...'
                    : data.dokumenUploaded.suratPimpinanPondok
                      ? 'Batal / Hapus'
                      : 'Upload'}
                </span>
              </button>
            </div>
            {/* Card 6: Masa Jabatan Pimpinan Pondok / Guru Mengaji */}
            <div className={styles.uploadCard}>
              <div className={styles.docIconContainer}>
                <span className={`${styles.docIcon} material-symbols-outlined`}>calendar_month</span>
              </div>
              <h4 className={styles.docTitle}>Masa Periode</h4>
              <p className={styles.docDesc}>Pimpinan Pondok atau Guru Mengaji</p>

              <div className={styles.masaJabatanGroup}>
                <div className={styles.masaJabatanField}>
                  <label className={styles.masaJabatanLabel}>Tahun Berlaku</label>
                  <input
                    type="number"
                    className={styles.masaJabatanInput}
                    placeholder="contoh: 2023"
                    min="2000"
                    max="2099"
                    value={data.masaJabatanMulai}
                    onChange={(e) => onChange({ masaJabatanMulai: e.target.value })}
                  />
                </div>

                <div className={styles.masaJabatanDivider}>
                  <span className={`material-symbols-outlined ${styles.masaJabatanArrow}`}>arrow_downward</span>
                  <span className={styles.masaJabatanHingga}>hingga</span>
                </div>

                <div className={styles.masaJabatanField}>
                  <label className={styles.masaJabatanLabel}>Tahun Berakhir</label>
                  <input
                    type="number"
                    className={styles.masaJabatanInput}
                    placeholder="contoh: 2026"
                    min="2000"
                    max="2099"
                    value={data.masaJabatanSelesai}
                    onChange={(e) => onChange({ masaJabatanSelesai: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {errorLocal && (
        <p className={styles.unfilledError} id="dokumen-validation-error">
          {errorLocal}
        </p>
      )}

      {/* Action buttons footer */}
      <div className={styles.actionFooter}>
        <button type="button" className={styles.btnBack} onClick={onBack} id="btn-back-step-3">
          <span className={styles.btnBackIcon}>arrow_back</span>
          <span>Kembali</span>
        </button>

        <div className={styles.btnGroupRight}>
          <button type="button" className={styles.btnDraft} onClick={onSaveDraft} id="btn-draft-step-3">
            Simpan Draft
          </button>
          <button type="button" className={styles.btnSubmit} onClick={validateAndSubmit} id="btn-submit-form">
            <span>Simpan</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
