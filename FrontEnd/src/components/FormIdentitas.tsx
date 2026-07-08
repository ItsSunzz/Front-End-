import React, { useState } from 'react';
import styles from './FormIdentitas.module.css';
import { FormData, Recipient } from '../types';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { api } from "../api";

registerLocale('id', id);

interface FormIdentitasProps {
  data: FormData;
  onChange: (fields: Partial<FormData>) => void;
  onNext: () => void;
  onCancel: () => void;
  adminKecamatan?: string;
  recipients?: Recipient[];
}

export default function FormIdentitas({ data, onChange, onNext, onCancel, adminKecamatan, recipients = [] }: FormIdentitasProps) {
  const [errorLocal, setErrorLocal] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [desaOptions, setDesaOptions] = useState<string[]>([]);

  // Load all kecamatan on mount
  React.useEffect(() => {
    const loadKecamatan = async () => {
      try {
        const res = await api.getKecamatan();
        setKecamatanList(res);
      } catch (err) {
        console.error(err);
      }
    };
    loadKecamatan();
  }, []);

  const activeKecamatan = adminKecamatan || data.kecamatan;

  // Load desa when activeKecamatan changes
  React.useEffect(() => {
    if (activeKecamatan && kecamatanList.length > 0) {
      const cleanActive = activeKecamatan.toLowerCase().replace('admin kecamatan', '').trim();
      const matchKec = kecamatanList.find(
        (k) => k.nama_kecamatan.toLowerCase().trim() === cleanActive
      );
      if (matchKec) {
        const loadDesa = async () => {
          try {
            const res = await api.getDesa(matchKec.kecamatan_id);
            setDesaOptions(res.map((d: any) => d.nama_desa));
          } catch (err) {
            console.error(err);
          }
        };
        loadDesa();
      } else {
        setDesaOptions([]);
      }
    } else {
      setDesaOptions([]);
    }
  }, [activeKecamatan, kecamatanList]);

  const filteredDesaOptions = desaOptions.filter((opt) =>
    opt.toLowerCase().includes((data.desaKelurahan || '').toLowerCase())
  );

  // Auto-set kecamatan dari session admin saat komponen mount
  React.useEffect(() => {
    if (adminKecamatan && data.kecamatan !== adminKecamatan) {
      onChange({ kecamatan: adminKecamatan, desaKelurahan: '' });
    }
  }, [adminKecamatan]);

  const kategoriOptions = ['Guru Mengaji', 'Pimpinan Pondok'];
  const kecamatanOptions = kecamatanList.map(k => k.nama_kecamatan).sort();

  const validateAndProceed = async () => {
    if (
      !data.namaLengkap.trim() ||
      !data.nik.trim() ||
      !data.tempatLahir.trim() ||
      !data.tanggalLahir ||
      !data.jenisKelamin ||
      !data.kategoriPenerima ||
      !data.rt?.trim() ||
      !data.rw?.trim() ||
      !data.dusun?.trim() ||
      !data.kecamatan ||
      !data.desaKelurahan.trim() ||
      !data.noKK?.trim()
    ) {
      setErrorLocal('Mohon lengkapi semua isian sebelum melanjutkan.');
      return;
    }

    if (data.nik.replace(/\D/g, '').length !== 16) {
      setErrorLocal('NIK harus tepat berisi 16 digit angka.');
      return;
    }

    if (data.noKK?.replace(/\D/g, '').length !== 16) {
      setErrorLocal('Nomor KK harus tepat berisi 16 digit angka.');
      return;
    }

    if (data.nik.trim() === data.noKK?.trim()) {
      setErrorLocal('Nomor NIK dan KK Tidak Boleh Sama');
      return;
    }

    try {
      const checkRes = await api.checkNik(data.nik.trim());
      if (checkRes.exists) {
        setErrorLocal('Data Ini Sudah Terdaftar');
        return;
      }
    } catch (err) {
      console.error('Gagal memvalidasi NIK:', err);
      const existing = recipients.find(r => r.nik === data.nik.trim());
      if (existing) {
        setErrorLocal('Data Ini Sudah Terdaftar');
        return;
      }
    }

    setErrorLocal('');
    onNext();
  };
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    onChange({ nik: val });
  };

  return (
    <div id="step-1-identitas" className="space-y-6">

      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepperTrack}>
          <div className={styles.lineBg} />
          <div className={styles.lineProgress} style={{ width: '0%' }} />

          <div className={styles.stepNode}>
            <div className={`${styles.stepCircle} ${styles.activeCircle}`}>1</div>
            <span className={`${styles.stepLabel} ${styles.activeLabel}`}>Identitas Diri</span>
          </div>

          <div className={styles.stepNode} style={{ opacity: 0.4 }}>
            <div className={styles.stepCircle}>2</div>
            <span className={styles.stepLabel}>Rekening</span>
          </div>

          <div className={styles.stepNode} style={{ opacity: 0.4 }}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>Dokumen</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className={styles.formCard} onClick={() => setOpenDropdown(null)}>

        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerIconContainer}>
            <span className={styles.headerIcon}>contact_page</span>
          </div>
          <div>
            <h3 className={styles.headerTitle}>Data Identitas Diri</h3>
            <p className={styles.headerSubtitle}>
              Isi data identitas penerima bantuan dengan lengkap dan benar sesuai KTP
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className={styles.cardBody}>
          <div className={styles.grid}>

            {/* Nama Lengkap */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-nama" className={styles.label}>
                Nama Lengkap<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-nama"
                  className={styles.input}
                  placeholder="Nama sesuai KTP"
                  value={data.namaLengkap}
                  onChange={(e) => onChange({ namaLengkap: e.target.value })}
                />
                <span className={styles.inputIcon}>person</span>
              </div>
            </div>

            {/* NIK */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-nik" className={styles.label}>
                NIK (Nomor Induk Kependudukan)<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-nik"
                  className={styles.input}
                  maxLength={16}
                  placeholder="16 digit NIK"
                  value={data.nik}
                  onChange={handleNikChange}
                />
                <span className={styles.inputIcon}>badge</span>
              </div>
            </div>

            {/* Tempat Lahir */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-tempat-lahir" className={styles.label}>
                Tempat Lahir<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-tempat-lahir"
                  className={styles.input}
                  placeholder="Kota/Kabupaten"
                  value={data.tempatLahir}
                  onChange={(e) => onChange({ tempatLahir: e.target.value })}
                />
                <span className={styles.inputIcon}>apartment</span>
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-tanggal-lahir" className={styles.label}>
                Tanggal Lahir<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <DatePicker
                  id="input-tanggal-lahir"
                  selected={data.tanggalLahir ? parseISO(data.tanggalLahir) : null}
                  onChange={(date: Date | null) => {
                    onChange({ tanggalLahir: date ? format(date, 'yyyy-MM-dd') : '' });
                  }}
                  locale="id"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className={styles.input}
                  wrapperClassName={styles.datePickerWrapper}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                />
                <span className={styles.inputIcon}>calendar_month</span>
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Jenis Kelamin<span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="Laki-laki"
                    checked={data.jenisKelamin === 'Laki-laki'}
                    onChange={() => onChange({ jenisKelamin: 'Laki-laki' })}
                    className={styles.radioInput}
                  />
                  <span>Laki-laki</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="Perempuan"
                    checked={data.jenisKelamin === 'Perempuan'}
                    onChange={() => onChange({ jenisKelamin: 'Perempuan' })}
                    className={styles.radioInput}
                  />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>

            {/* Kategori Penerima */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Kategori Penerima<span className={styles.required}>*</span>
              </label>
              <div
                className={styles.inputWrapper}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori');
                }}
              >
                <div className={`${styles.input} ${styles.customSelect} ${openDropdown === 'kategori' ? styles.inputFocused : ''}`}>
                  {data.kategoriPenerima || <span className={styles.placeholder}>-- Pilih Kategori --</span>}
                </div>
                <span className={`${styles.inputIcon} ${openDropdown === 'kategori' ? styles.iconFocused : ''}`}>group</span>
                <span className={`${styles.arrowIcon} ${openDropdown === 'kategori' ? styles.arrowUp : ''}`}>expand_more</span>
                {openDropdown === 'kategori' && (
                  <div className={styles.dropdownMenu}>
                    {kategoriOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${data.kategoriPenerima === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({ kategoriPenerima: opt });
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

            {/* RT */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-rt" className={styles.label}>
                RT<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-rt"
                  className={styles.input}
                  placeholder="contoh: 001"
                  maxLength={3}
                  value={data.rt || ''}
                  onChange={(e) => onChange({ rt: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                />
                <span className={styles.inputIcon}>location_on</span>
              </div>
            </div>

            {/* RW */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-rw" className={styles.label}>
                RW<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-rw"
                  className={styles.input}
                  placeholder="contoh: 002"
                  maxLength={3}
                  value={data.rw || ''}
                  onChange={(e) => onChange({ rw: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                />
                <span className={styles.inputIcon}>location_on</span>
              </div>
            </div>

            {/* Dusun */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-dusun" className={styles.label}>
                Dusun<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-dusun"
                  className={styles.input}
                  placeholder="Nama dusun"
                  value={data.dusun || ''}
                  onChange={(e) => onChange({ dusun: e.target.value })}
                />
                <span className={styles.inputIcon}>holiday_village</span>
              </div>
            </div>
            {/* Desa/Kelurahan */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Desa/Kelurahan<span className={styles.required}>*</span>
              </label>
              <div
                className={styles.inputWrapper}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder={activeKecamatan ? '-- Pilih atau Ketik Desa --' : '-- Pilih Kecamatan dulu --'}
                  className={styles.input}
                  value={data.desaKelurahan}
                  onChange={(e) => {
                    onChange({ desaKelurahan: e.target.value });
                    setOpenDropdown('desa');
                  }}
                  onFocus={() => {
                    if (desaOptions.length > 0) {
                      setOpenDropdown('desa');
                    }
                  }}
                  disabled={desaOptions.length === 0}
                  style={{
                    opacity: desaOptions.length === 0 ? 0.5 : 1,
                    cursor: desaOptions.length === 0 ? 'not-allowed' : 'text',
                  }}
                />
                <span className={styles.inputIcon}>home_work</span>
                <span
                  className={`${styles.arrowIcon} ${openDropdown === 'desa' ? styles.arrowUp : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (desaOptions.length > 0) {
                      setOpenDropdown(openDropdown === 'desa' ? null : 'desa');
                    }
                  }}
                >
                  expand_more
                </span>
                {openDropdown === 'desa' && filteredDesaOptions.length > 0 && (
                  <div className={styles.dropdownMenu}>
                    {filteredDesaOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`${styles.dropdownItem} ${data.desaKelurahan === opt ? styles.dropdownItemSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({ desaKelurahan: opt });
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

            {/* Nomor KK */}
            <div className={styles.fieldGroup}>
              <label htmlFor="input-kk" className={styles.label}>
                Nomor KK (Kartu Keluarga)<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="input-kk"
                  className={styles.input}
                  maxLength={16}
                  placeholder="16 digit Nomor KK"
                  value={data.noKK || ''}
                  onChange={(e) => onChange({ noKK: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                />
                <span className={styles.inputIcon}>badge</span>
              </div>
            </div>

            {/* Kecamatan */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Kecamatan<span className={styles.required}>*</span>
              </label>
              {adminKecamatan ? (
                <div className={styles.inputWrapper}>
                  <div className={`${styles.input}`} style={{ color: 'var(--text-primary)', cursor: 'default' }}>
                    {adminKecamatan}
                  </div>
                  <span className={styles.inputIcon}>map</span>
                </div>
              ) : (
                <div
                  className={styles.inputWrapper}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'kecamatan' ? null : 'kecamatan');
                  }}
                >
                  <div className={`${styles.input} ${styles.customSelect} ${openDropdown === 'kecamatan' ? styles.inputFocused : ''}`}>
                    {data.kecamatan || <span className={styles.placeholder}>-- Pilih Kecamatan --</span>}
                  </div>
                  <span className={`${styles.inputIcon} ${openDropdown === 'kecamatan' ? styles.iconFocused : ''}`}>map</span>
                  <span className={`${styles.arrowIcon} ${openDropdown === 'kecamatan' ? styles.arrowUp : ''}`}>expand_more</span>
                  {openDropdown === 'kecamatan' && (
                    <div className={styles.dropdownMenu}>
                      {kecamatanOptions.map((opt) => (
                        <div
                          key={opt}
                          className={`${styles.dropdownItem} ${data.kecamatan === opt ? styles.dropdownItemSelected : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange({ kecamatan: opt, desaKelurahan: '' });
                            setOpenDropdown(null);
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>{/* end .grid */}

          {/* Error Message */}
          {errorLocal && (
            <p className={styles.unfilledError} id="identitas-validation-error">
              {errorLocal}
            </p>
          )}

        </div>{/* end .cardBody */}

        {/* Form Footer */}
        <div className={styles.actionFooter}>
          <button type="button" className={styles.btnCancel} onClick={onCancel} id="btn-cancel-step-1">
            Batal
          </button>
          <button type="button" className={styles.btnNext} onClick={validateAndProceed} id="btn-next-step-1">
            <span>Selanjutnya</span>
            <span className={styles.btnNextIcon}>arrow_forward</span>
          </button>
        </div>

      </div>{/* end .formCard */}

    </div>
  );
}