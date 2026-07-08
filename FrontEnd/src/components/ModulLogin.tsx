import React, { useState } from 'react';
import styles from './ModulLogin.module.css';
import logoBoyolali from '../assets/LogoBoyolali.png';
import { UserAccount } from '../types';

interface ModulLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: UserAccount) => void;
}

export default function ModulLogin({ isOpen, onClose, onLoginSuccess }: ModulLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validKecamatan = [
    'ampel', 'andong', 'banyudono', 'boyolali', 'cepogo', 'gladagsari',
    'juwangi', 'karanggede', 'kemusu', 'klego', 'mojosongo', 'musuk',
    'ngemplak', 'nogosari', 'sambi', 'sawit', 'selo', 'simo',
    'tamansari', 'teras', 'wonosegoro', 'wonosamudro'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan password Anda.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal. Periksa kembali kredensial Anda.');
        return;
      }

      // Simpan token ke sessionStorage
      sessionStorage.setItem('auth_token', data.token);

      setError('');
      // Kirim data user dari backend ke App.tsx
      onLoginSuccess(data.admin);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan atau server tidak merespon.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

        {/* Tombol Close di pojok kanan atas modal */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Branding di Bagian Atas */}
        <div className={styles.brandHeader}>
          <img
            src={logoBoyolali}
            alt="Logo Kabupaten Boyolali"
            className={styles.brandLogo}
          />
          <div className={styles.brandText}>
            <p className={styles.brandTitle}>PEMKAB BOYOLALI</p>
            <p className={styles.brandSubtitle}>PEMERINTAH KABUPATEN BOYOLALI</p>
          </div>
        </div>

        <div className={styles.brandContent}>
          <h1 className={styles.mainTitle}>SISTEM PENDATAAN</h1>
          <p className={styles.highlightText}>GURU MENGAJI DAN PIMPINAN PONDOK</p>
        </div>

        {/* Form Login */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.fieldGroup}>
            <label htmlFor="login-email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="login-email"
                className={styles.input}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="login-password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            LOGIN
          </button>
        </form>

      </div>
    </div>
  );
}