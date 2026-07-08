import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { api } from '../api';

interface UserManagementProps {
  users: UserAccount[];
  onAddUser: (user: any) => void;
  onUpdateUser: (user: any) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserManagement({
  users = [],
  onAddUser,
  onUpdateUser,
  onToggleStatus,
  onResetPassword,
  onDeleteUser,
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [districts, setDistricts] = useState<any[]>([]);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'super_admin' | 'kecamatan'>('kecamatan');
  const [formDistrictId, setFormDistrictId] = useState<number | ''>('');
  const [formPassword, setFormPassword] = useState('');

  // Confirmation Modals State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState<'toggle' | 'reset'>('toggle');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Fetch districts on mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await api.getKecamatan();
        setDistricts(res);
      } catch (err) {
        console.error('Gagal mengambil data kecamatan:', err);
      }
    };
    loadDistricts();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('kecamatan');
    setFormDistrictId('');
    setFormPassword('');
    setOpenDropdown(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setFormName(user.nama);
    setFormEmail(user.email);
    setFormRole(user.role === 'super_admin' ? 'super_admin' : 'kecamatan');
    setFormDistrictId(user.kecamatan_id || ''); // Map kecamatan_id / district_id
    setFormPassword('');
    setOpenDropdown(null);
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) return;

    if (formRole === 'kecamatan' && !formDistrictId) {
      alert('Plotting Wilayah Tugas (Kecamatan) wajib dipilih untuk Admin Kecamatan.');
      return;
    }

    const districtIdVal = formRole === 'kecamatan' && formDistrictId ? formDistrictId : null;
    const districtName = formRole === 'super_admin' 
      ? 'Kabupaten Boyolali' 
      : districts.find(d => d.kecamatan_id === districtIdVal)?.nama_kecamatan || '';

    const displayNama = formRole === 'super_admin' 
      ? 'Setda Kabupaten Boyolali' 
      : `Admin Kecamatan ${districtName}`;

    if (isEditMode && editingUserId) {
      onUpdateUser({
        id: editingUserId,
        nama: displayNama,
        email: formEmail.toLowerCase(),
        role: formRole,
        district_id: districtIdVal,
        password: formPassword || undefined,
        wilayah: districtName
      });
    } else {
      onAddUser({
        nama: displayNama,
        email: formEmail.toLowerCase(),
        role: formRole,
        district_id: districtIdVal,
        password: formPassword || '123456',
      });
    }
    setShowFormModal(false);
  };

  const triggerToggleStatusConfirm = (user: UserAccount) => {
    setSelectedUser(user);
    setConfirmType('toggle');
    setShowConfirmModal(true);
  };

  const triggerResetPasswordConfirm = (user: UserAccount) => {
    setSelectedUser(user);
    setConfirmType('reset');
    setConfirmPasswordInput('');
    setShowConfirmModal(true);
  };

  const executeConfirmAction = () => {
    if (!selectedUser) return;

    if (confirmType === 'toggle') {
      onToggleStatus(selectedUser.id);
    } else if (confirmType === 'reset') {
      if (!confirmPasswordInput.trim()) return;
      onResetPassword(selectedUser.id, confirmPasswordInput);
    }

    setShowConfirmModal(false);
    setSelectedUser(null);
  };

  // Filter users based on search
  const filteredUsers = users.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.wilayah && u.wilayah.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 animate-fade-in font-sans">
      <div className="bg-white border border-[#c1c8c0] rounded-2xl shadow-sm overflow-hidden w-full max-w-full min-w-0">
        
        {/* Card Header */}
        <div className="px-4 py-4 md:px-8 md:py-6 border-b border-[#e0e3e5] flex flex-col md:flex-row justify-between items-start md:items-center bg-[#f8fafc] gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-extrabold text-[#001408]">Daftar Pengguna Sistem</h3>
            <p className="text-xs text-slate-500 font-medium">Kelola akun petugas, reset sandi, dan suspensi akses.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex items-center w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Cari pengguna..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium text-slate-700 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Add User Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-[#e0e3e5] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-4">Email / Username</th>
                <th className="px-6 py-4">Role / Akses</th>
                <th className="px-6 py-4">Kecamatan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5] text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSuperAdmin = u.role === 'super_admin' || u.role === 'Super Admin';
                  const isKecamatan = u.role === 'kecamatan' || u.role === 'Admin Kecamatan';
                  const displayRole = isSuperAdmin ? 'Super Admin' : (isKecamatan ? 'Admin Kecamatan' : u.role);
                  const displayWilayah = isSuperAdmin ? 'Kabupaten Boyolali' : `Kec. ${u.wilayah || '-'}`;
                  const isActive = u.status === 'aktif' || u.status === 'Aktif';
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg">
                          {displayRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{isSuperAdmin ? 'Kabupaten Boyolali' : (u.wilayah || '-')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-200 rounded-lg shadow-sm hover:bg-emerald-50 transition-all cursor-pointer mx-auto"
                            onClick={() => handleOpenEditModal(u)}
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Tidak ada akun pengguna yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL: TAMBAH / EDIT PENGGUNA */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form 
            onSubmit={handleFormSubmit}
            onClick={() => setOpenDropdown(null)}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e0e3e5] flex justify-between items-center bg-[#f8fafc]">
              <h3 className="font-bold text-[#001408] text-base">
                {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button 
                type="button" 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setShowFormModal(false)}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email / Username</label>
                <input
                  type="email"
                  required
                  placeholder="Misal: cepogo@boyolali.go.id"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all font-semibold text-slate-700 bg-white"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role / Hak Akses</label>
                <div 
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'role' ? null : 'role');
                  }}
                >
                  <div 
                    className={`w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none transition-all font-semibold text-slate-700 bg-white cursor-pointer flex justify-between items-center select-none ${openDropdown === 'role' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : ''}`}
                  >
                    <span>{formRole === 'super_admin' ? 'Super Admin' : 'Admin Kecamatan'}</span>
                    <span className={`material-symbols-outlined text-slate-500 text-xl transition-transform duration-200 ${openDropdown === 'role' ? 'rotate-180 text-emerald-600' : ''}`}>
                      expand_more
                    </span>
                  </div>

                  {openDropdown === 'role' && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in py-1">
                      <div 
                        className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${formRole === 'kecamatan' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormRole('kecamatan');
                          setOpenDropdown(null);
                        }}
                      >
                        Admin Kecamatan
                      </div>
                      <div 
                        className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${formRole === 'super_admin' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormRole('super_admin');
                          setOpenDropdown(null);
                        }}
                      >
                        Super Admin
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* District Dropdown (hidden if Super Admin chosen) */}
              {formRole !== 'super_admin' && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plotting Wilayah Tugas (Kecamatan)</label>
                  <div 
                    className="relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'district' ? null : 'district');
                    }}
                  >
                    <div 
                      className={`w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none transition-all font-semibold text-slate-700 bg-white cursor-pointer flex justify-between items-center select-none ${openDropdown === 'district' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : ''}`}
                    >
                      <span>
                        {formDistrictId 
                          ? districts.find(d => d.kecamatan_id === formDistrictId)?.nama_kecamatan 
                          : '-- Pilih Kecamatan --'}
                      </span>
                      <span className={`material-symbols-outlined text-slate-500 text-xl transition-transform duration-200 ${openDropdown === 'district' ? 'rotate-180 text-emerald-600' : ''}`}>
                        expand_more
                      </span>
                    </div>

                    {openDropdown === 'district' && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto animate-fade-in py-1">
                        <div 
                          className="px-4 py-2.5 text-sm font-semibold cursor-pointer text-slate-400 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormDistrictId('');
                            setOpenDropdown(null);
                          }}
                        >
                          -- Pilih Kecamatan --
                        </div>
                        {districts.map((d) => (
                          <div 
                            key={d.kecamatan_id}
                            className={`px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${formDistrictId === d.kecamatan_id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDistrictId(d.kecamatan_id);
                              setOpenDropdown(null);
                            }}
                          >
                            {d.nama_kecamatan}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEditMode ? 'Ubah Password (Kosongkan jika tidak ingin diubah)' : 'Sandi Sementara (Min. 6 Karakter)'}
                </label>
                <input
                  type="text"
                  required={!isEditMode}
                  placeholder={isEditMode ? "Masukkan password baru jika ingin diubah" : "Masukkan sandi atau biarkan default (123456)"}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all font-semibold text-slate-700 bg-white"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                {!isEditMode && (
                  <span className="text-[10px] text-slate-400 font-medium">Bila dikosongkan, sandi otomatis diset ke "123456"</span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#e0e3e5] flex justify-between items-center bg-[#f8fafc]">
              <div>
                {isEditMode && formEmail !== 'setda@boyolali.go.id' && (
                  <button 
                    type="button" 
                    className="px-4 py-2 text-sm font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    onClick={() => {
                      if (editingUserId) {
                        onDeleteUser(editingUserId);
                        setShowFormModal(false);
                      }
                    }}
                  >
                    Hapus
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setShowFormModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Simpan Akun'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRMATION POP-UP MODAL */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e0e3e5] flex items-center gap-2 text-amber-600 bg-amber-50">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-bold text-amber-800 text-sm">
                Konfirmasi Tindakan
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {confirmType === 'toggle' ? (
                  <>
                    Apakah Anda yakin ingin <strong>{selectedUser.status === 'aktif' || selectedUser.status === 'Aktif' ? 'menonaktifkan' : 'mengaktifkan'}</strong> akun pengguna berikut?
                    <br />
                    <span className="mt-2 block font-semibold text-emerald-950">
                      {selectedUser.nama} ({selectedUser.email})
                    </span>
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin <strong>mereset password</strong> akun pengguna berikut?
                    <br />
                    <span className="mt-2 block font-semibold text-emerald-950">
                      {selectedUser.nama} ({selectedUser.email})
                    </span>
                  </>
                )}
              </p>

              {confirmType === 'reset' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
                  <input
                    type="text"
                    required
                    placeholder="SandiBaru123"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all font-semibold text-slate-700 bg-white"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#e0e3e5] flex justify-end gap-2 bg-[#f8fafc]">
              <button 
                type="button" 
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedUser(null);
                }}
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={executeConfirmAction}
                disabled={confirmType === 'reset' && !confirmPasswordInput.trim()}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmType === 'toggle' 
                    ? (selectedUser.status === 'aktif' || selectedUser.status === 'Aktif' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700')
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
