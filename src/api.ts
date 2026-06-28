import { UserAccount, Recipient } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem('auth_token');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada API');
  }
  
  return data;
}

export const api = {
  // Authentication
  async login(email: string, password: string) {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  },

  async logout() {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } finally {
      sessionStorage.removeItem('auth_token');
    }
  },

  async changePassword(oldPass: string, newPass: string) {
    return apiFetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
  },

  // Recipients / Submissions
  async getRecipients(filters?: { status?: string; tahun?: string }): Promise<Recipient[]> {
    const token = sessionStorage.getItem('auth_token');
    let url = '/public-recipients';
    if (token) {
      url = '/pengajuan';
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tahun) params.append('tahun', filters.tahun);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return apiFetch(url);
  },

  async createRecipient(formData: any) {
    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'dokumenUploaded' && val) {
        Object.entries(val).forEach(([docKey, fileVal]) => {
          if (fileVal instanceof File) {
            body.append(docKey, fileVal);
          }
        });
      } else if (val !== null && val !== undefined) {
        body.append(key, val as any);
      }
    });

    return apiFetch('/pengajuan', {
      method: 'POST',
      body,
    });
  },

  async updateRecipient(id: number, fields: Partial<Recipient>) {
    return apiFetch(`/pengajuan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },

  async deleteRecipient(id: number) {
    return apiFetch(`/pengajuan/${id}`, {
      method: 'DELETE',
    });
  },

  async validateRecipient(id: number, status: 'disetujui' | 'ditolak', catatan?: string) {
    return apiFetch(`/pengajuan/${id}/validate`, {
      method: 'PATCH',
      body: JSON.stringify({
        status_pengajuan: status,
        catatan_pengajuan: catatan,
      }),
    });
  },

  async checkNik(nik: string): Promise<{ exists: boolean; message: string }> {
    return apiFetch(`/pengajuan/check-nik/${nik}`);
  },

  // Regions
  async getKecamatan(): Promise<any[]> {
    return apiFetch('/kecamatan');
  },

  async getDesa(kecamatanId: number): Promise<any[]> {
    return apiFetch(`/desa?kecamatan_id=${kecamatanId}`);
  },

  // User Management (Super Admin)
  async getUsers(): Promise<UserAccount[]> {
    return apiFetch('/users');
  },

  async createUser(user: Partial<UserAccount> & { password?: string }): Promise<any> {
    return apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateUser(id: string, user: Partial<UserAccount> & { password?: string }): Promise<any> {
    return apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async deleteUser(id: string): Promise<any> {
    return apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleUserStatus(id: string): Promise<any> {
    return apiFetch(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  async resetUserPassword(id: string, newPass: string): Promise<any> {
    return apiFetch(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPass }),
    });
  },
};
