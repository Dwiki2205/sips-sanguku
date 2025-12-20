// app/(dashboard)/owner/membership/edit/[id]/page.tsx - VERSION WITH DEBUG
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import ModalPopup from '@/components/ui/ModalPopup';
import { UpdateMembershipData, MembershipTier } from '@/types/membership';

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const isValidMembershipTier = (tier: string): tier is MembershipTier => {
  return ['Silver', 'Gold', 'Platinum'].includes(tier);
};

export default function EditMembershipPage() {
  const router = useRouter();
  const { id } = useParams();

  console.log('🔄 EditMembershipPage mounted with ID:', id);

  // State untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalAction, setModalAction] = useState<'close' | 'redirect'>('close');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UpdateMembershipData>({
    pelanggan_id: '',
    tanggal_daftar: '',
    tier_membership: 'Silver',
    expired_date: '',
  });

  useEffect(() => {
    console.log('🎯 useEffect triggered, ID:', id);
    if (id) {
      fetchMembershipData();
    } else {
      console.error('❌ ID is undefined or null');
      showModal('error', 'ID Tidak Valid', 'ID membership tidak ditemukan');
      setLoading(false);
    }
  }, [id]);

  const fetchMembershipData = async () => {
    console.log('📥 Starting fetchMembershipData for ID:', id);
    
    try {
      setLoading(true);
      const apiUrl = `/api/membership/${id}`;
      console.log('🌐 Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.details || errorMessage;
        } catch (e) {
          // Jika bukan JSON, gunakan teks asli
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      if (data.success && data.data) {
        const m = data.data;
        console.log('📋 Membership data received:', m);
        
        // Validasi tier
        const tier: MembershipTier = isValidMembershipTier(m.tier_membership) 
          ? m.tier_membership 
          : 'Silver';
        
        const formattedData = {
          pelanggan_id: m.pelanggan_id || '',
          tanggal_daftar: formatDateForInput(m.tanggal_daftar),
          tier_membership: tier,
          expired_date: formatDateForInput(m.expired_date),
        };
        
        console.log('✨ Formatted form data:', formattedData);
        setForm(formattedData);
      } else {
        console.error('❌ API returned success:false:', data);
        showModal('warning', 'Data membership tidak ditemukan', data.error || 'Data tidak ditemukan');
      }
    } catch (error: any) {
      console.error('❌ Fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Cek apakah error karena ID tidak valid
      if (error.message.includes('ID membership') || error.message.includes('tidak ditemukan')) {
        showModal('warning', 'Data Tidak Ditemukan', error.message);
      } else if (error.message.includes('Koneksi database')) {
        showModal('error', 'Koneksi Database Gagal', 'Tidak dapat terhubung ke database. Silakan coba lagi.');
      } else {
        showModal('error', 'Gagal Memuat Data', error.message || 'Terjadi kesalahan saat memuat data');
      }
    } finally {
      console.log('🏁 fetchMembershipData completed');
      setLoading(false);
    }
  };

  const showModal = (type: 'success' | 'warning' | 'error', title: string, message: string, action: 'close' | 'redirect' = 'close') => {
    console.log('🪟 Showing modal:', { type, title, message, action });
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'tier_membership') {
      // Validasi bahwa value adalah MembershipTier yang valid
      if (!isValidMembershipTier(value)) {
        console.warn(`Invalid tier value: ${value}`);
        return;
      }

      if (form.tanggal_daftar) {
        const date = new Date(form.tanggal_daftar);
        const newDate = new Date(date);
        switch (value) {
          case 'Silver': newDate.setMonth(newDate.getMonth() + 1); break;
          case 'Gold': newDate.setMonth(newDate.getMonth() + 6); break;
          case 'Platinum': newDate.setFullYear(newDate.getFullYear() + 1); break;
          default: newDate.setMonth(newDate.getMonth() + 1);
        }
        const newExpired = newDate.toISOString().split('T')[0];
        setForm(prev => ({ 
          ...prev, 
          [name]: value as MembershipTier, 
          expired_date: newExpired 
        }));
      } else {
        setForm(prev => ({ 
          ...prev, 
          [name]: value as MembershipTier 
        }));
      }
    } else if (name === 'tanggal_daftar') {
      if (value) {
        const date = new Date(value);
        const newDate = new Date(date);
        switch (form.tier_membership) {
          case 'Silver': newDate.setMonth(newDate.getMonth() + 1); break;
          case 'Gold': newDate.setMonth(newDate.getMonth() + 6); break;
          case 'Platinum': newDate.setFullYear(newDate.getFullYear() + 1); break;
        }
        const newExpired = newDate.toISOString().split('T')[0];
        setForm(prev => ({ 
          ...prev, 
          [name]: value, 
          expired_date: newExpired 
        }));
      } else {
        setForm(prev => ({ 
          ...prev, 
          [name]: value, 
          expired_date: '' 
        }));
      }
    } else {
      setForm(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting || !id) return;

    // Validasi data
    if (!form.pelanggan_id || !form.tanggal_daftar || !form.expired_date) {
      showModal('warning', 'Data Belum Lengkap', 'Harap isi semua field yang wajib diisi');
      return;
    }

    // Validasi tanggal
    const startDate = new Date(form.tanggal_daftar);
    const endDate = new Date(form.expired_date);
    
    if (endDate < startDate) {
      showModal('warning', 'Tanggal Tidak Valid', 'Tanggal expired tidak boleh sebelum tanggal daftar');
      return;
    }

    try {
      setSubmitting(true);

      // Format data sesuai dengan yang diharapkan backend
      const submitData = {
        pelanggan_id: form.pelanggan_id.trim(),
        tanggal_daftar: form.tanggal_daftar,
        tier_membership: form.tier_membership,
        expired_date: form.expired_date,
      };

      console.log('📤 Sending update data:', { id, ...submitData });

      const res = await fetch(`/api/membership/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();
      
      console.log('📥 Received response:', result);

      if (res.ok && result.success) {
        showModal('success', 'Berhasil!', result.message || 'Membership berhasil diperbarui!', 'redirect');
      } else {
        showModal('warning', 'Gagal', result.error || 'Gagal memperbarui membership');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      showModal('error', 'Error', error.message || 'Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatus = () => {
    if (!form.expired_date) return 'Tidak diketahui';
    const today = new Date();
    const expired = new Date(form.expired_date);
    today.setHours(0, 0, 0, 0);
    expired.setHours(0, 0, 0, 0);
    
    return expired < today ? 'Kadaluarsa' : 'Aktif';
  };

  const getTierDuration = (tier: MembershipTier) => {
    switch (tier) {
      case 'Silver': return '1 Bulan';
      case 'Gold': return '6 Bulan';
      case 'Platinum': return '1 Tahun';
      default: return '1 Bulan';
    }
  };

  const handleModalClose = () => {
    console.log('🔒 Closing modal, action:', modalAction);
    setModalOpen(false);
    if (modalAction === 'redirect') {
      router.push('/owner/membership');
    }
  };

  // Tampilkan loading dengan informasi debug
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <span className="text-gray-600 mb-2">Memuat data membership...</span>
          <span className="text-sm text-gray-400">ID: {id}</span>
          <div className="mt-4 text-xs text-gray-500">
            <p>Memuat dari: /api/membership/{id}</p>
            <p>Silakan buka Developer Console (F12) untuk melihat detail</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
        <div className="px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/membership')}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Membership #{id}</h1>
            <p className="text-sm opacity-90 mt-1">Perbarui data membership pelanggan</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KOLOM KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Membership</label>
                <input
                  readOnly
                  value={id || ''}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">ID tidak dapat diubah</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Pelanggan <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="pelanggan_id"
                  value={form.pelanggan_id}
                  onChange={handleChange}
                  placeholder="Contoh: PLG001"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan ID pelanggan yang valid</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Daftar <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  name="tanggal_daftar"
                  value={form.tanggal_daftar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">Tanggal mulai membership</p>
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
                  disabled={submitting}
                >
                  <option value="Silver">Silver - 1 Bulan</option>
                  <option value="Gold">Gold - 6 Bulan</option>
                  <option value="Platinum">Platinum - 1 Tahun</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Durasi: {getTierDuration(form.tier_membership)} (otomatis diperbarui)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Expired <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  name="expired_date"
                  value={form.expired_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dihitung otomatis berdasarkan tier dan tanggal daftar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Membership</label>
                <div className={`w-full px-4 py-3 rounded-lg border font-medium ${
                  getStatus() === 'Aktif' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {getStatus()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Status dihitung berdasarkan tanggal expired: {form.expired_date ? new Date(form.expired_date).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* RINGKASAN */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Ringkasan Perubahan:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-blue-600 font-medium mb-1">Tier Membership</div>
                <div className="font-bold">{form.tier_membership}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-blue-600 font-medium mb-1">Tanggal Mulai</div>
                <div className="font-bold">
                  {form.tanggal_daftar ? new Date(form.tanggal_daftar).toLocaleDateString('id-ID') : '-'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="text-blue-600 font-medium mb-1">Tanggal Expired</div>
                <div className="font-bold">
                  {form.expired_date ? new Date(form.expired_date).toLocaleDateString('id-ID') : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/membership')}
              disabled={submitting}
              className="px-8"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memperbarui...
                </>
              ) : (
                'Update Membership'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL POPUP */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        cancelText="Tutup"
      />
    </div>
  );
}