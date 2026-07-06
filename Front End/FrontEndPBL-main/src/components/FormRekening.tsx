import React, { useState, useEffect } from 'react';
import styles from './FormRekening.module.css';
import { FormData } from '../types';

interface FormRekeningProps {
  data: FormData;
  onChange: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export default function FormRekening({
  data,
  onChange,
  onNext,
  onBack,
  onSaveDraft
}: FormRekeningProps) {
  const [errorLocal, setErrorLocal] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (data.namaLengkap && !data.namaPemilikRekening) {
      onChange({ namaPemilikRekening: data.namaLengkap });
    }
  }, [data.namaLengkap]);

  const bankOptions = [
    { value: 'Bank Jateng', label: 'Bank Jateng(Cab.Boyolali)' },
    { value: 'Bank Boyolali', label: 'Bank Boyolali' },
    { value: 'Bank BKK', label: 'Bank BKK Boyolali' },
  ];

  const validateAndProceed = () => {
    if (!data.namaPemilikRekening.trim() || !data.noRekening.trim() || !data.bank) {
      setErrorLocal('Mohon lengkapi data pemilik rekening, nomor rekening, dan pilihan bank.');
      return;
    }

    if (data.noRekening.replace(/\D/g, '').length < 8) {
      setErrorLocal('Nomor rekening bank harus valid (minimal 8 digit angka).');
      return;
    }

    setErrorLocal('');
    onNext();
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    onChange({ noRekening: val });
  };

  return (
    <div id="step-2-rekening" className="space-y-6" onClick={() => setOpenDropdown(null)}>
      {/* progress Stepper Progress Bar */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperTrack}>
          <div className={styles.lineBg} />
          <div className={styles.lineProgress} style={{ width: '50%' }} />

          {/* Step 1 (Completed) */}
          <div className={styles.stepNode} onClick={onBack} style={{ cursor: 'pointer' }}>
            <div className={`${styles.stepCircle} ${styles.completedCircle}`}>
              <span className={styles.checkMark}>check</span>
            </div>
            <span className={styles.stepLabel}>Identitas Diri</span>
          </div>

          {/* Step 2 */}
          <div className={styles.stepNode}>
            <div className={`${styles.stepCircle} ${styles.activeCircle}`}>2</div>
            <span className={`${styles.stepLabel} ${styles.activeLabel}`}>Rekening</span>
          </div>

          {/* Step 3 */}
          <div className={styles.stepNode} style={{ opacity: 0.4 }}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>Dokumen</span>
          </div>
        </div>
      </div>

      {/* Form: Data Rekening Bank */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerIconContainer}>
            <span className={`${styles.headerIcon} material-symbols-outlined`}>account_balance</span>
          </div>
          <div>
            <h3 className={styles.headerTitle}>Data Rekening Bank</h3>
            <p className={styles.headerSubtitle}>
              Isi data rekening bank penerima untuk transfer dana bantuan
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.grid}>
            {/* Nama Pemilik Rekening */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-nama-pemilik" className={styles.label}>
                Nama Pemilik Rekening<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-nama-pemilik"
                  className={styles.input}
                  placeholder="Sesuai buku tabungan"
                  value={data.namaPemilikRekening}
                  onChange={(e) => onChange({ namaPemilikRekening: e.target.value })}
                  readOnly
                  style={{ cursor: 'not-allowed', opacity: 0.7 }}
                  required
                />
                <span className={styles.inputIcon}>person</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}></p>
            </div>

            {/* No. Rekening */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-norek" className={styles.label}>
                No. Rekening<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-norek"
                  className={styles.input}
                  placeholder="Nomor rekening aktif"
                  value={data.noRekening}
                  onChange={handleAccountChange}
                  required
                />
                <span className={styles.inputIcon}>credit_card</span>
              </div>
            </div>

            {/* Bank Pilihan */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Pilihan Bank (Bank Operasional)<span className={styles.required}>*</span>
              </label>
              <div
                className={styles.inputWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'bank' ? null : 'bank');
                }}
              >
                <div className={`${styles.input} ${styles.customSelect} ${openDropdown === 'bank' ? styles.inputFocused : ''}`}>
                  {bankOptions.find(b => b.value === data.bank)?.label || <span className={styles.placeholder}>-- Pilih Bank --</span>}
                </div>
                <span className={`${styles.inputIcon} ${openDropdown === 'bank' ? styles.iconFocused : ''}`}>account_balance</span>
                <span className={`${styles.arrowIcon} ${openDropdown === 'bank' ? styles.arrowUp : ''}`}>expand_more</span>

                {openDropdown === 'bank' && (
                  <div className={styles.dropdownMenu}>
                    {bankOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`${styles.dropdownItem} ${data.bank === opt.value ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({ bank: opt.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section: Ringkasan Data info */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryHeaderIcon}>assignment</span>
          <h3 className={styles.summaryHeaderTitle}>Ringkasan Data Identitas Diri (Verifikasi)</h3>
        </div>
        <div className={styles.summaryBody}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Nama Lengkap</span>
              <span className={styles.summaryValue}>{data.namaLengkap || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>NIK</span>
              <span className={styles.summaryValue}>{data.nik || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tempat Lahir</span>
              <span className={styles.summaryValue}>{data.tempatLahir || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tanggal Lahir</span>
              <span className={styles.summaryValue}>{data.tanggalLahir || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Jenis Kelamin</span>
              <span className={styles.summaryValue}>{data.jenisKelamin || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Kategori</span>
              <span className={styles.summaryValue}>{data.kategoriPenerima || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Kecamatan</span>
              <span className={styles.summaryValue}>{data.kecamatan || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Desa / Kelurahan</span>
              <span className={styles.summaryValue}>{data.desaKelurahan || '-'}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Nomor KK</span>
              <span className={styles.summaryValue}>{data.noKK || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {errorLocal && (
        <p className={styles.unfilledError} id="rekening-validation-error">
          {errorLocal}
        </p>
      )}

      {/* Action Navigation Buttons */}
      <div className={styles.actionFooter}>
        <button type="button" className={styles.btnBack} onClick={onBack} id="btn-back-step-2">
          <span className={styles.btnBackIcon}>arrow_back</span>
          <span>Kembali</span>
        </button>

        <div className={styles.btnGroupRight}>
          <button type="button" className={styles.btnDraft} onClick={onSaveDraft} id="btn-draft-step-2">
            Simpan Draft
          </button>
          <button type="button" className={styles.btnNext} onClick={validateAndProceed} id="btn-next-step-2">
            <span>Lanjut</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
