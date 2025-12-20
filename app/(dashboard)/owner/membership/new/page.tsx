'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ModalPopup from '@/components/ui/ModalPopup';
import { ArrowLeft } from 'lucide-react';

type FormData = {
  pelanggan_id: string;
  tanggal_daftar: string;
  tier_membership: string;
  expired_date: string;
};

type ApiError = {
  message: string;
  error?: string;
  code?: string;
  details?: string;
};

export default function NewMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [form, setForm] = useState<FormData>({
    pelanggan_id: '',
    tanggal_daftar: new Date().toISOString().split('T')[0],
    tier_membership: 'Silver',
    expired_date: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const generatedId = `MEM${String(Date.now()).slice(-3)}`;

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fungsi untuk membandingkan tanggal tanpa waktu
  const compareDates = (dateStr1: string, dateStr2: string): number => {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    
    // Set waktu ke 00:00:00 untuk kedua tanggal
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
  };

  // Hitung expired date otomatis
  useEffect(() => {
    if (form.tanggal_daftar) {
      const date = new Date(form.tanggal_daftar);
      const newDate = new Date(date);

      switch (form.tier_membership) {
        case 'Silver':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'Gold':
          newDate.setMonth(newDate.getMonth() + 6);
          break;
        case 'Platinum':
          newDate.setFullYear(newDate.getFullYear() + 1);
          break;
        default:
          newDate.setMonth(newDate.getMonth() + 1);
      }

      setForm(prev => ({
        ...prev,
        expired_date: newDate.toISOString().split('T')[0]
      }));
    }
  }, [form.tanggal_daftar, form.tier_membership]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!form.pelanggan_id.trim()) {
      newErrors.pelanggan_id = 'ID Pelanggan harus diisi';
    } else if (form.pelanggan_id.trim().length < 3) {
      newErrors.pelanggan_id = 'ID Pelanggan minimal 3 karakter';
    }
    
    if (!form.tanggal_daftar) {
      newErrors.tanggal_daftar = 'Tanggal daftar harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error ketika user mulai mengisi
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi form
    if (!validateForm()) {
      setModalType('warning');
      setModalTitle('Data Belum Diisi Lengkap');
      setModalMessage('Harap lengkapi semua field yang wajib diisi dengan benar.');
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          membership_id: generatedId,
          ...form,
        }),
      });

      // Cek status code terlebih dahulu
      if (res.status === 409) {
        // Status 409 Conflict - pasti sudah terdaftar
        setModalType('warning');
        setModalTitle('Data Membership Sudah Terdaftar');
        setModalMessage('Pelanggan ini sudah memiliki membership aktif. Silakan periksa kembali ID Pelanggan.');
        
        // Coba parse response untuk mendapatkan detail error
        try {
          const data = await res.json();
          if (data.message || data.error) {
            setModalMessage(`Pelanggan ini sudah memiliki membership aktif. (${data.message || data.error})`);
          }
        } catch {
          // Jika response bukan JSON, gunakan pesan default
        }
        
        setModalOpen(true);
        return;
      }

      // Jika bukan 409, coba parse response
      const data = await res.json();

      if (res.ok) {
        setModalType('success');
        setModalTitle('Tambah membership berhasil');
        setModalMessage(`Membership dengan ID ${generatedId} berhasil ditambahkan.`);
        setModalOpen(true);
      } else {
        // Handle error dari backend dengan berbagai kemungkinan format
        const errorData = data as ApiError;
        let errorMessage = errorData.message || errorData.error || 'Gagal membuat membership';
        
        // Debug: log error untuk melihat format sebenarnya
        console.log('Error response:', errorData);
        console.log('Response status:', res.status);
        
        // Cek berbagai kemungkinan format error
        const lowerErrorMessage = errorMessage.toLowerCase();
        
        if (
          lowerErrorMessage.includes('sudah terdaftar') || 
          lowerErrorMessage.includes('duplicate') ||
          lowerErrorMessage.includes('exists') ||
          lowerErrorMessage.includes('terdaftar') ||
          lowerErrorMessage.includes('unique constraint') ||
          lowerErrorMessage.includes('conflict')
        ) {
          setModalType('warning');
          setModalTitle('Data Membership Sudah Terdaftar');
          setModalMessage('Pelanggan ini sudah memiliki membership aktif. Silakan periksa kembali ID Pelanggan.');
        } else if (lowerErrorMessage.includes('not found') || lowerErrorMessage.includes('tidak ditemukan')) {
          setModalType('warning');
          setModalTitle('Pelanggan Tidak Ditemukan');
          setModalMessage('ID Pelanggan yang dimasukkan tidak valid.');
        } else if (lowerErrorMessage.includes('invalid') || lowerErrorMessage.includes('tidak valid')) {
          setModalType('warning');
          setModalTitle('Data Tidak Valid');
          setModalMessage(errorMessage);
        } else if (res.status === 400) {
          setModalType('warning');
          setModalTitle('Data Tidak Valid');
          setModalMessage(errorMessage || 'Data yang dimasukkan tidak valid.');
        } else if (res.status === 500) {
          setModalType('error');
          setModalTitle('Server Error');
          setModalMessage('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        } else {
          setModalType('error');
          setModalTitle('Gagal Membuat Membership');
          setModalMessage(errorMessage);
        }
        setModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setModalType('error');
        setModalTitle('Koneksi Gagal');
        setModalMessage('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setModalType('error');
        setModalTitle('Terjadi Kesalahan');
        setModalMessage('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
      }
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Jika sukses, langsung redirect ke list membership
    if (modalType === 'success') {
      router.push('/owner/membership');
    }
  };

  const getTierDuration = (tier: string) => {
    switch (tier) {
      case 'Silver': return '1 Bulan';
      case 'Gold': return '6 Bulan';
      case 'Platinum': return '1 Tahun';
      default: return '1 Bulan';
    }
  };

  const getStatus = () => {
    if (!form.expired_date) return 'Tidak diketahui';
    const expired = new Date(form.expired_date);
    const today = new Date();
    return expired < today ? 'Kadaluarsa' : 'Aktif';
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* HEADER BIRU */}
        <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
          <div className="px-6 py-5 flex items-center gap-4">
            <button
              onClick={() => router.push('/owner/membership')}
              className="p-2 hover:bg-blue-700 rounded-full transition"
              type="button"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Tambah Membership Baru</h1>
          </div>
        </div>

        {/* FORM */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8" noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Membership</label>
                  <input 
                    readOnly 
                    value={generatedId} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300" 
                  />
                  <p className="text-xs text-gray-500 mt-1">ID akan digenerate otomatis</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Pelanggan <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="pelanggan_id" 
                    value={form.pelanggan_id} 
                    onChange={handleChange} 
                    placeholder="PLG001"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.pelanggan_id ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition`} 
                  />
                  {errors.pelanggan_id ? (
                    <p className="text-xs text-red-500 mt-1">{errors.pelanggan_id}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Masukkan ID pelanggan yang valid</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Daftar <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="tanggal_daftar" 
                    value={form.tanggal_daftar} 
                    onChange={handleChange}
                    max={getTodayDate()}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.tanggal_daftar ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`} 
                  />
                  {errors.tanggal_daftar && (
                    <p className="text-xs text-red-500 mt-1">{errors.tanggal_daftar}</p>
                  )}
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier Membership <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="tier_membership" 
                    value={form.tier_membership} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="Silver">Silver - 1 Bulan</option>
                    <option value="Gold">Gold - 6 Bulan</option>
                    <option value="Platinum">Platinum - 1 Tahun</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Durasi: {getTierDuration(form.tier_membership)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Expired <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="expired_date" 
                    value={form.expired_date} 
                    onChange={handleChange} 
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Membership</label>
                  <input 
                    readOnly 
                    value={getStatus()}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-100 font-medium border border-gray-300 ${getStatus() === 'Aktif' ? 'text-green-600' : 'text-red-600'}`} 
                  />
                </div>
              </div>
            </div>

            {/* RINGKASAN */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Ringkasan Membership:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-blue-600">Tier: </span><span className="font-medium">{form.tier_membership}</span></div>
                <div><span className="text-blue-600">Tanggal Daftar: </span><span className="font-medium">
                  {form.tanggal_daftar ? new Date(form.tanggal_daftar).toLocaleDateString('id-ID') : '-'}</span></div>
                <div><span className="text-blue-600">Expired: </span><span className="font-medium">
                  {form.expired_date ? new Date(form.expired_date).toLocaleDateString('id-ID') : '-'}</span></div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Membership akan berlaku selama {getTierDuration(form.tier_membership).toLowerCase()}
              </div>
            </div>

            {/* TOMBOL */}
            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="danger" 
                size="lg" 
                onClick={() => router.push('/owner/membership')} 
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={loading}
                className="px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Membership'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL POPUP */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
    </>
  );
}