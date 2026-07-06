import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ModulLogin from './components/ModulLogin';
import Dashboard from './components/Dashboard';
import FormIdentitas from './components/FormIdentitas';
import FormRekening from './components/FormRekening';
import FormDokumen from './components/FormDokumen';
import HalamanSelesai from './components/HalamanSelesai';
import LihatData from './components/LihatData';
import ManajemenUser from './components/ManajemenUser';
import { ViewType, FormData, UserSession, Recipient, UserAccount, ActivityLog } from './types';
import History from './components/History';
import KelolaData from './components/KelolaData';
import UserManagement from './components/UserManagement';
import Profil from './components/Profil';
import { api } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Restore user session from sessionStorage on startup
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = sessionStorage.getItem('user_session');
    const token = sessionStorage.getItem('auth_token');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Clean up if desynced on startup
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('auth_token');
    return {
      isLoggedIn: false,
      nama: '',
      role: '',
      avatar: '',
    };
  });

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const addActivityLog = (user: string, actionText: string, type: 'success' | 'warning' | 'info' | 'error') => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      user: user,
      aksi: actionText,
      waktu: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      tipe: type,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const [formData, setFormData] = useState<FormData>({
    namaLengkap: '',
    nik: '',
    noKK: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    kategoriPenerima: '',
    rt: '',
    rw: '',
    dusun: '',
    kecamatan: '',
    desaKelurahan: '',
    namaPemilikRekening: '',
    noRekening: '',
    bank: '',
    masaJabatanMulai: '',
    masaJabatanSelesai: '',
    dokumenUploaded: {
      ktp: null,
      kk: null,
      suratPutusan: null,
      suratKeterangan: null,
      suratPimpinanPondok: null,
      suratGuruMengaji: null,
    },
  });

  const emptyFormData: FormData = {
    namaLengkap: '',
    nik: '',
    noKK: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    kategoriPenerima: '',
    rt: '',
    rw: '',
    dusun: '',
    kecamatan: '',
    desaKelurahan: '',
    namaPemilikRekening: '',
    noRekening: '',
    bank: '',
    masaJabatanMulai: '',
    masaJabatanSelesai: '',
    dokumenUploaded: {
      ktp: null,
      kk: null,
      suratPutusan: null,
      suratKeterangan: null,
      suratPimpinanPondok: null,
      suratGuruMengaji: null,
    },
  };

  const [drafts, setDrafts] = useState<{ id: string; timestamp: Date; data: FormData }[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lastLogoutTime, setLastLogoutTime] = useState<Date | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch recipients list
  const fetchRecipients = async () => {
    try {
      const data = await api.getRecipients();
      setRecipients(data);
    } catch (err: any) {
      if (err?.message !== 'Unauthenticated.' && err?.message !== 'Unauthenticated') {
        console.error('Gagal mengambil data penerima:', err);
      }
    }
  };

  // Fetch users list (for Super Admin)
  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      if (err?.message !== 'Unauthenticated.' && err?.message !== 'Unauthenticated') {
        console.error('Gagal mengambil data user:', err);
      }
    }
  };

  // Handle unauthorized event (token expired/invalidated)
  React.useEffect(() => {
    const handleUnauthorized = () => {
      setUserSession({
        isLoggedIn: false,
        nama: '',
        role: '',
        avatar: '',
      });
      setShowLoginModal(true);
      triggerToast('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  // Load backend data automatically
  React.useEffect(() => {
    fetchRecipients();
    if (userSession.isLoggedIn && userSession.role === 'Super Admin') {
      fetchUsers();
    }
  }, [userSession.isLoggedIn, userSession.role]);

  // Login handler
  const handleLoginSuccess = (admin: any) => {
    let avatarUser = 'AD';
    if (admin.nama) {
      avatarUser = admin.nama.substring(0, 2).toUpperCase();
    }

    // Map roles for backward compatibility with frontend session
    let mappedRole = admin.role;
    if (admin.role === 'super_admin') mappedRole = 'Super Admin';
    if (admin.role === 'kecamatan') mappedRole = 'Admin Kecamatan';

    const sessionData = {
      isLoggedIn: true,
      nama: admin.nama,
      role: mappedRole,
      avatar: avatarUser,
      email: admin.email,
      kecamatan: admin.nama_kecamatan ?? admin.wilayah ?? '',
    };

    sessionStorage.setItem('user_session', JSON.stringify(sessionData));
    setUserSession(sessionData);
    setShowLoginModal(false);
    triggerToast(`Selamat Datang! Anda berhasil masuk sebagai ${admin.nama}.`);
    setCurrentView('dashboard');
    setCurrentStep(1);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('auth_token');
    setLastLogoutTime(new Date());
    setCurrentDraftId(null);
    setUserSession({
      isLoggedIn: false,
      nama: '',
      role: '',
      avatar: '',
      email: '',
    });
    setFormData(emptyFormData);
    setCurrentView('dashboard');
    setCurrentStep(1);
    triggerToast('Anda telah keluar dari aplikasi.');
  };

  const handleFormChange = (fields: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  // Submit form data
  const handleFormSubmit = async () => {
    try {
      const submitData = {
        nama_lengkap: formData.namaLengkap,
        nik: formData.nik,
        no_kk: formData.noKK,
        tempat_lahir: formData.tempatLahir,
        tanggal_lahir: formData.tanggalLahir,
        jenis_kelamin: formData.jenisKelamin,
        rt: formData.rt,
        rw: formData.rw,
        dusun: formData.dusun,
        kategori_penerima: formData.kategoriPenerima,
        bank: formData.bank,
        nomor_rekening: formData.noRekening,
        nama_pemilik_rekening: formData.namaPemilikRekening,
        desa_kelurahan: formData.desaKelurahan,
        masa_jabatan_mulai: formData.masaJabatanMulai,
        masa_jabatan_selesai: formData.masaJabatanSelesai,
        // Files
        foto_ktp: formData.dokumenUploaded.ktp,
        foto_kk: formData.dokumenUploaded.kk,
        surat_putusan: formData.dokumenUploaded.suratPutusan,
        surat_keterangan: formData.dokumenUploaded.suratKeterangan,
        surat_pimpinan_pondok: formData.kategoriPenerima === 'Pimpinan Pondok' ? formData.dokumenUploaded.suratPimpinanPondok : null,
        surat_guru_mengaji: formData.kategoriPenerima === 'Guru Mengaji' ? formData.dokumenUploaded.suratPimpinanPondok : null,
      };

      await api.createRecipient(submitData);
      await fetchRecipients();

      setCurrentStep(4);
      setCurrentDraftId(null);
      setFormData(emptyFormData);
      triggerToast('Data permohonan bantuan kesejahteraan berhasil disimpan dan diajukan!');
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Gagal mengirimkan pengajuan.');
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (currentDraftId) {
      setDrafts(prev => prev.map(draft =>
        draft.id === currentDraftId
          ? { ...draft, timestamp: new Date(), data: formData }
          : draft
      ));
      triggerToast('Draft Berhasil Diperbarui!');
    } else {
      const newId = Date.now().toString();
      const newDraft = {
        id: newId,
        timestamp: new Date(),
        data: formData,
      };
      setDrafts((prev) => [newDraft, ...prev]);
      setCurrentDraftId(newId);
      triggerToast('Draft Berhasil Disimpan!');
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#f7f9fb] flex">

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[45] lg:hidden transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT NAVIGATION SIDEBAR */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'input-data') {
            setCurrentStep(1);
            setFormData(emptyFormData);
            setCurrentDraftId(null);
          }
          setIsSidebarOpen(false);
        }}
        userSession={userSession}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* RIGHT CONTENT FRAME AREA */}
      <div className="flex-grow lg:ml-[280px] ml-0 flex flex-col min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden">

        {/* HEADER TOP BAR */}
        <Header
          currentView={currentView}
          userSession={userSession}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          drafts={drafts}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLoadDraft={(draftData, draftId) => {
            setFormData(draftData);
            setCurrentDraftId(draftId);
            setCurrentView('input-data');
            setCurrentStep(1);
            triggerToast('Draft berhasil dimuat!');
          }}
        />

        {/* CONTROLLER SWITCH SCREEN VIEWS */}
        <main className="flex-grow p-3 md:p-10 max-w-7xl mx-auto w-full">

          {currentView === 'dashboard' && (
            <Dashboard
              userSession={userSession}
              recipients={recipients}
              onLoginClick={() => setShowLoginModal(true)}
              onNavigateToInput={() => {
                setCurrentView('input-data');
                setCurrentStep(1);
              }}
            />
          )}

          {currentView === 'input-data' && (
            <>
              {currentStep === 1 && (
                <FormIdentitas
                  data={formData}
                  onChange={handleFormChange}
                  onNext={() => setCurrentStep(2)}
                  adminKecamatan={userSession.kecamatan}
                  recipients={recipients}
                  onCancel={() => {
                    setCurrentView('dashboard');
                    setCurrentDraftId(null);
                    triggerToast('Batal mengisi formulir bantuan.');
                  }}
                />
              )}

              {currentStep === 2 && (
                <FormRekening
                  data={formData}
                  onChange={handleFormChange}
                  onBack={() => setCurrentStep(1)}
                  onNext={() => setCurrentStep(3)}
                  onSaveDraft={handleSaveDraft}
                />
              )}

              {currentStep === 3 && (
                <FormDokumen
                  data={formData}
                  onChange={handleFormChange}
                  onBack={() => setCurrentStep(2)}
                  onSubmit={handleFormSubmit}
                  onSaveDraft={handleSaveDraft}
                />
              )}

              {currentStep === 4 && (
                <HalamanSelesai
                  onReturnToDashboard={() => {
                    setCurrentView('dashboard');
                    setCurrentStep(1);
                    setFormData(emptyFormData);
                  }}
                  onFillOtherData={() => {
                    setFormData(emptyFormData);
                    setCurrentStep(1);
                  }}
                />
              )}
            </>
          )}

          {currentView === 'lihat-data' && (
            <LihatData
              recipients={recipients}
              userSession={userSession}
            />
          )}

          {currentView === 'manajemen-user' && (
            <ManajemenUser
              recipients={recipients}
              userSession={userSession}
              onUpdate={async (updatedRec: Recipient) => {
                try {
                  await api.validateRecipient(updatedRec.id!, updatedRec.status === 'Terverifikasi' ? 'disetujui' : 'ditolak', updatedRec.catatan);
                  await fetchRecipients();
                  if (updatedRec.status === 'Terverifikasi') {
                    triggerToast(`Data ${updatedRec.nama} berhasil diverifikasi!`, 'success');
                  } else {
                    triggerToast(`Pengajuan ${updatedRec.nama} berhasil ditolak!`, 'error');
                  }
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal mengubah status verifikasi.', 'error');
                }
              }}
              onDelete={async (niks: string[]) => {
                try {
                  const toDelete = recipients.filter(r => niks.includes(r.nik));
                  for (const r of toDelete) {
                    if (r.id) await api.deleteRecipient(r.id);
                  }
                  await fetchRecipients();
                  triggerToast(`${niks.length} data berhasil dihapus.`, 'success');
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal menghapus data.', 'error');
                }
              }}
            />
          )}

          {currentView === 'kelola-data' && (
            <KelolaData
              recipients={recipients}
              userSession={userSession}
              onRefresh={fetchRecipients}
              onUpdate={async (updatedRec: Recipient) => {
                try {
                  await api.updateRecipient(updatedRec.id!, updatedRec);
                  await fetchRecipients();
                  triggerToast('Data berhasil diperbarui!', 'success');
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal memperbarui data.', 'error');
                }
              }}
              onDelete={async (niks: string[]) => {
                try {
                  const toDelete = recipients.filter(r => niks.includes(r.nik));
                  for (const r of toDelete) {
                    if (r.id) await api.deleteRecipient(r.id);
                  }
                  await fetchRecipients();
                  triggerToast(`${niks.length} data berhasil dihapus.`, 'success');
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal menghapus data.', 'error');
                }
              }}
            />
          )}

          {currentView === 'user-management' && (
            <UserManagement
              users={users}
              onAddUser={async (newUser) => {
                try {
                  await api.createUser({
                    nama: newUser.nama,
                    email: newUser.email,
                    role: newUser.role,
                    district_id: newUser.district_id,
                    password: newUser.password,
                  });
                  await fetchUsers();
                  addActivityLog(userSession.nama, `Menambahkan pengguna baru: ${newUser.email} (${newUser.nama})`, 'success');
                  triggerToast(`User ${newUser.nama} berhasil ditambahkan!`, 'success');
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal menambahkan user.', 'error');
                }
              }}
              onUpdateUser={async (updatedUser) => {
                try {
                  await api.updateUser(updatedUser.id, {
                    nama: updatedUser.nama,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    district_id: updatedUser.district_id,
                    password: updatedUser.password || undefined,
                  });
                  await fetchUsers();
                  addActivityLog(userSession.nama, `Memperbarui info pengguna: ${updatedUser.email}`, 'info');
                  triggerToast(`User ${updatedUser.nama} berhasil diperbarui!`, 'success');
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal memperbarui user.', 'error');
                }
              }}
              onToggleStatus={async (userId) => {
                try {
                  const targetUser = users.find(u => u.id === userId);
                  if (targetUser) {
                    const res = await api.toggleUserStatus(userId);
                    await fetchUsers();
                    addActivityLog(userSession.nama, `Mengubah status akun ${targetUser.email} menjadi ${res.status}`, 'warning');
                    triggerToast(`Status akun ${targetUser.nama} diubah menjadi ${res.status}!`, 'success');
                  }
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal mengubah status user.', 'error');
                }
              }}
              onResetPassword={async (userId, newPass) => {
                try {
                  const targetUser = users.find(u => u.id === userId);
                  if (targetUser) {
                    await api.resetUserPassword(userId, newPass);
                    addActivityLog(userSession.nama, `Mereset password akun ${targetUser.email}`, 'warning');
                    triggerToast(`Password akun ${targetUser.nama} berhasil direset!`, 'success');
                  }
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal mereset sandi.', 'error');
                }
              }}
              onDeleteUser={async (userId) => {
                try {
                  const targetUser = users.find(u => u.id === userId);
                  if (targetUser) {
                    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${targetUser.email}?`)) {
                      await api.deleteUser(userId);
                      await fetchUsers();
                      addActivityLog(userSession.nama, `Menghapus akun pengguna: ${targetUser.email}`, 'error');
                      triggerToast(`User ${targetUser.nama} berhasil dihapus!`, 'success');
                    }
                  }
                } catch (err: any) {
                  triggerToast(err.message || 'Gagal menghapus user.', 'error');
                }
              }}
            />
          )}

          {currentView === 'history' && (
            <History recipients={recipients} />
          )}

          {currentView === 'profil' && (
            <Profil
              userSession={userSession}
              onUpdateSession={(updatedSession) => {
                const newSession = { ...userSession, ...updatedSession };
                sessionStorage.setItem('user_session', JSON.stringify(newSession));
                setUserSession(newSession);
                triggerToast('Profil berhasil diperbarui!');
              }}
              lastLogoutTime={lastLogoutTime}
            />
          )}
        </main>
      </div>

      {/* LOGIN MODAL */}
      <ModulLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* FLOATING MICRO TOAST BANNERS */}
      {toast && (
        <div
          id="toast-notification-popup"
          className={`fixed bottom-8 right-8 border text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-all duration-300 transform translate-y-0 scale-100 ${
            toast.type === 'error'
              ? 'bg-[#1a0505] border-[#ff6b6b]'
              : 'bg-[#001408] border-[#6BFF8F]'
          }`}
        >
          <span className={`material-symbols-outlined font-bold ${
            toast.type === 'error' ? 'text-[#ff6b6b]' : 'text-[#6BFF8F]'
          }`}>
            {toast.type === 'error' ? 'cancel' : 'check_circle'}
          </span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}