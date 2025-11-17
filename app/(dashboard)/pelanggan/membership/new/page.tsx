'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import ModalPopup from '@/components/ui/ModalPopup';
import { ArrowLeft, Info, CheckCircle, Lock, AlertCircle, RefreshCw, Zap } from 'lucide-react';

// Define types
interface MembershipForm {
  tanggal_daftar: string;
  tier_membership: string;
  expired_date: string;
}

interface TierCriteria {
  minBooking: number;
  maxBooking: number | null;
  description: string;
  benefits: string[];
}

interface DebugInfo {
  membershipApiResponse?: any;
  pelangganId?: string;
}

interface NextTierProgress {
  nextTier: string | null;
  current: number;
  required: number | null;
  progress: number;
}

export default function PelangganMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingMembership, setExistingMembership] = useState<any>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [allowedTiers, setAllowedTiers] = useState<string[]>(['Silver']);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [autoUpgradeAvailable, setAutoUpgradeAvailable] = useState(false);
  const [recommendedTier, setRecommendedTier] = useState('Silver');

  const [form, setForm] = useState<MembershipForm>({
    tanggal_daftar: new Date().toISOString().split('T')[0],
    tier_membership: 'Silver',
    expired_date: '',
  });

  // State modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const generatedId = `MEM${String(Date.now()).slice(-6)}`;

  const durations = [
    { label: '1 Bulan', months: 1 },
    { label: '3 Bulan', months: 3 },
    { label: '6 Bulan', months: 6 },
    { label: '9 Bulan', months: 9 },
    { label: '1 Tahun', months: 12 },
  ];

  // Kriteria tier berdasarkan jumlah booking
  const tierCriteria: Record<string, TierCriteria> = {
    Silver: { 
      minBooking: 0, 
      maxBooking: 4, 
      description: 'Tier dasar - daftar manual',
      benefits: [
        'Diskon 5% untuk setiap booking',
        'Prioritas booking di jam sepi',
        'Akses notifikasi promo'
      ]
    },
    Gold: { 
      minBooking: 5, 
      maxBooking: 14, 
      description: 'Upgrade otomatis dari Silver',
      benefits: [
        'Diskon 15% untuk setiap booking',
        '1x booking gratis per bulan',
        'Akses VIP lounge',
        'Prioritas booking 24 jam'
      ]
    },
    Platinum: { 
      minBooking: 15, 
      maxBooking: null, 
      description: 'Tier tertinggi - upgrade otomatis dari Gold',
      benefits: [
        'Diskon 30% untuk setiap booking',
        '3x booking gratis per bulan',
        'Konsultasi personal trainer gratis',
        'Akses event eksklusif',
        'Prioritas maksimal semua fitur'
      ]
    }
  };

  // Fungsi untuk menentukan tier yang diizinkan berdasarkan booking count
  const getAllowedTiers = (count: number): string[] => {
    const tiers = ['Silver'];
    
    if (count >= tierCriteria.Gold.minBooking) {
      tiers.push('Gold');
    }
    if (count >= tierCriteria.Platinum.minBooking) {
      tiers.push('Platinum');
    }
    
    return tiers;
  };

  // Fungsi untuk mendapatkan tier yang direkomendasikan berdasarkan booking count
  const getRecommendedTier = (count: number): string => {
    if (count >= tierCriteria.Platinum.minBooking) return 'Platinum';
    if (count >= tierCriteria.Gold.minBooking) return 'Gold';
    return 'Silver';
  };

  // Fungsi untuk mendapatkan progress menuju tier berikutnya
  const getNextTierProgress = (currentCount: number): NextTierProgress => {
    if (currentCount < tierCriteria.Gold.minBooking) {
      return {
        nextTier: 'Gold',
        current: currentCount,
        required: tierCriteria.Gold.minBooking,
        progress: Math.min((currentCount / tierCriteria.Gold.minBooking) * 100, 100)
      };
    } else if (currentCount < tierCriteria.Platinum.minBooking) {
      return {
        nextTier: 'Platinum',
        current: currentCount,
        required: tierCriteria.Platinum.minBooking,
        progress: Math.min((currentCount / tierCriteria.Platinum.minBooking) * 100, 100)
      };
    } else {
      return {
        nextTier: null,
        current: currentCount,
        required: null,
        progress: 100
      };
    }
  };

  // Fungsi untuk memeriksa apakah perlu upgrade otomatis
  const checkAutoUpgrade = (currentMembership: any, bookingCount: number): boolean => {
    if (!currentMembership) return false;
    
    const currentTier = currentMembership.tier_membership;
    const recommendedTier = getRecommendedTier(bookingCount);
    
    // Cek apakah tier saat ini lebih rendah dari yang direkomendasikan
    const tierOrder = ['Silver', 'Gold', 'Platinum'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const recommendedIndex = tierOrder.indexOf(recommendedTier);
    
    return recommendedIndex > currentIndex;
  };

  // Fungsi untuk melakukan upgrade otomatis
  const performAutoUpgrade = async () => {
    if (!existingMembership || !autoUpgradeAvailable) return;
    
    const newTier = getRecommendedTier(bookingCount);
    
    try {
      const requestBody = {
        membership_id: existingMembership.membership_id,
        pelanggan_id: user.pengguna_id,
        tanggal_daftar: existingMembership.tanggal_daftar,
        tier_membership: newTier,
        expired_date: existingMembership.expired_date,
        status_keaktifan: 'active',
        updated_at: new Date().toISOString()
      };

      console.log('Performing auto-upgrade:', requestBody);

      const res = await fetch(`/api/membership/${existingMembership.membership_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        // Update local state
        setExistingMembership({ ...existingMembership, tier_membership: newTier });
        setForm(prev => ({ ...prev, tier_membership: newTier }));
        
        setModalType('success');
        setModalTitle('Upgrade Otomatis Berhasil!');
        setModalMessage(`Selamat! Membership Anda telah diupgrade otomatis ke tier ${newTier} karena telah mencapai ${bookingCount} booking sukses.`);
        setModalOpen(true);
        
        // Reset auto upgrade flag
        setAutoUpgradeAvailable(false);
      } else {
        console.error('Auto-upgrade failed');
      }
    } catch (error) {
      console.error('Error during auto-upgrade:', error);
    }
  };

  // Fungsi untuk memuat ulang data
  const reloadData = async () => {
    setLoading(true);
    await fetchUserData();
  };

  const fetchUserData = async () => {
    try {
      console.log('🔄 Starting to fetch user data...');
      
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) throw new Error('Failed to fetch user data');
      
      const userData = await userRes.json();
      console.log('✅ User data fetched:', userData);
      setUser(userData);

      if (userData.role_name === 'pelanggan') {
        // 1. Fetch membership data
        console.log('🔄 Fetching membership data for:', userData.pengguna_id);
        const membershipRes = await fetch(`/api/membership?pelanggan_id=${userData.pengguna_id}`);
        
        if (!membershipRes.ok) throw new Error('Failed to fetch membership data');
        
        const membershipData = await membershipRes.json();
        console.log('✅ Membership API response:', membershipData);

        // Debug: Simpan info untuk ditampilkan
        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          membershipApiResponse: membershipData,
          pelangganId: userData.pengguna_id
        }));

        let count = 0;
        
        // 2. Fetch booking count
        try {
          console.log('🔄 Fetching booking count for:', userData.pengguna_id);
          const bookingRes = await fetch(`/api/booking/count?pelanggan_id=${userData.pengguna_id}`);
          
          if (bookingRes.ok) {
            const bookingData = await bookingRes.json();
            count = bookingData.count || 0;
            console.log('✅ Booking count fetched:', count);
          } else {
            console.log('❌ Booking count API returned error status');
            count = 0;
          }
        } catch (error) {
          console.log('❌ Booking count fetch failed:', error);
          count = 0;
        }
        
        setBookingCount(count);
        const tiers = getAllowedTiers(count);
        setAllowedTiers(tiers);
        
        const recTier = getRecommendedTier(count);
        setRecommendedTier(recTier);
        
        console.log('✅ Allowed tiers:', tiers);
        console.log('✅ Recommended tier:', recTier);

        // 3. Process membership data
        let activeMembership = null;
        
        if (membershipData.success && Array.isArray(membershipData.data)) {
          console.log('📊 Processing membership data array:', membershipData.data);
          
          // Cari membership aktif
          activeMembership = membershipData.data.find((m: any) => {
            const isActive = m.status_keaktifan === 'active';
            const isNotExpired = new Date(m.expired_date) >= new Date();
            console.log(`🔍 Checking membership ${m.membership_id}:`, {
              status_keaktifan: m.status_keaktifan,
              expired_date: m.expired_date,
              isActive,
              isNotExpired,
              tier: m.tier_membership
            });
            return isActive && isNotExpired;
          });

          if (activeMembership) {
            console.log('✅ Active membership found:', activeMembership);
            setExistingMembership(activeMembership);
            
            // Check if auto-upgrade is available
            const needsUpgrade = checkAutoUpgrade(activeMembership, count);
            setAutoUpgradeAvailable(needsUpgrade);
            console.log('🔄 Auto-upgrade available:', needsUpgrade);
            
            if (needsUpgrade) {
              // Tampilkan notifikasi upgrade otomatis
              setTimeout(() => {
                setModalType('warning');
                setModalTitle('Upgrade Otomatis Tersedia!');
                setModalMessage(`Anda memenuhi syarat untuk upgrade otomatis ke ${recTier} karena telah mencapai ${count} booking sukses. Klik "Upgrade Otomatis" untuk meningkatkan tier membership Anda.`);
                setModalOpen(true);
              }, 1000);
            }
          } else {
            console.log('ℹ️ No active membership found');
            setExistingMembership(null);
            setAutoUpgradeAvailable(false);
          }
        } else {
          console.log('❌ Invalid membership data structure:', membershipData);
          setExistingMembership(null);
          setAutoUpgradeAvailable(false);
        }

        // 4. Set form values
        if (activeMembership) {
          setForm({
            tanggal_daftar: new Date().toISOString().split('T')[0],
            tier_membership: tiers.includes(activeMembership.tier_membership) 
              ? activeMembership.tier_membership 
              : recTier,
            expired_date: '',
          });
        } else {
          setForm((prev: MembershipForm) => ({
            ...prev,
            tier_membership: recTier
          }));
        }

      } else {
        setModalType('error');
        setModalTitle('Akses Ditolak');
        setModalMessage('Hanya pelanggan yang dapat mengakses halaman membership.');
        setModalOpen(true);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error: any) {
      console.error('❌ Error in fetchUserData:', error);
      setModalType('error');
      setModalTitle('Error');
      setModalMessage('Gagal memuat data. Silakan refresh halaman.');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setExpiredDate = (months: number) => {
    const start = new Date(form.tanggal_daftar);
    const exp = new Date(start);
    exp.setMonth(exp.getMonth() + months);
    setForm({ ...form, expired_date: exp.toISOString().split('T')[0] });
  };

  const checkExisting = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/membership?pelanggan_id=${user.pengguna_id}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const active = data.data.find((m: any) => 
          m.status_keaktifan === 'active' && new Date(m.expired_date) >= new Date()
        );
        
        if (active) {
          setModalType('warning');
          setModalTitle('Membership Aktif Ditemukan');
          setModalMessage(`Anda sudah memiliki membership ${active.tier_membership} yang aktif hingga ${new Date(active.expired_date).toLocaleDateString('id-ID')}. Anda dapat memperpanjang atau upgrade membership.`);
          setModalOpen(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking existing membership:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi tier yang dipilih
    if (!allowedTiers.includes(form.tier_membership)) {
      setModalType('warning');
      setModalTitle('Tier Tidak Memenuhi Syarat');
      const required = tierCriteria[form.tier_membership as keyof typeof tierCriteria].minBooking;
      setModalMessage(`Anda belum memenuhi syarat untuk tier ${form.tier_membership}. Syarat: minimal ${required} booking sukses. Saat ini Anda memiliki ${bookingCount} booking.`);
      setModalOpen(true);
      return;
    }

    // Validasi expired date
    if (!form.expired_date) {
      setModalType('warning');
      setModalTitle('Data Belum Diisi Lengkap');
      setModalMessage('Harap pilih tanggal expired dengan mengklik salah satu durasi atau memilih tanggal manual.');
      setModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      let endpoint = '/api/membership';
      let method = 'POST';

      if (existingMembership && existingMembership.status_keaktifan === 'active') {
        endpoint = `/api/membership/${existingMembership.membership_id}`;
        method = 'PUT';
      }

      const requestBody: any = {
        membership_id: existingMembership ? existingMembership.membership_id : generatedId,
        pelanggan_id: user.pengguna_id,
        tanggal_daftar: form.tanggal_daftar,
        tier_membership: form.tier_membership,
        expired_date: form.expired_date,
        status_keaktifan: new Date(form.expired_date) < new Date() ? 'expired' : 'active'
      };

      if (method === 'PUT') {
        requestBody.updated_at = new Date().toISOString();
      }

      console.log('Submitting membership data:', { endpoint, method, requestBody });

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        setModalType('success');
        if (method === 'PUT') {
          setModalTitle('Membership Berhasil Diupgrade');
          setModalMessage(`Membership Anda telah diupgrade ke ${form.tier_membership} dan diperpanjang hingga ${new Date(form.expired_date).toLocaleDateString('id-ID')}.`);
        } else {
          setModalTitle('Pendaftaran Membership Berhasil');
          setModalMessage(`Selamat! Membership ${form.tier_membership} Anda telah aktif hingga ${new Date(form.expired_date).toLocaleDateString('id-ID')}.`);
        }
        setModalOpen(true);
        
        // Reset auto upgrade setelah perubahan manual
        setAutoUpgradeAvailable(false);
      } else {
        const err = await res.json();
        setModalType('error');
        setModalTitle('Terjadi Kesalahan');
        setModalMessage(err.error || 'Gagal memproses membership. Silakan coba lagi.');
        setModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error submitting membership:', err);
      setModalType('error');
      setModalTitle('Koneksi Gagal');
      setModalMessage('Terjadi masalah dengan koneksi. Silakan coba lagi.');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === 'success') {
      router.push('/pelanggan/dashboard');
    }
  };

  const handleAutoUpgrade = () => {
    performAutoUpgrade();
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data membership...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Gagal memuat data pengguna. Silakan login kembali.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-4"
            variant="primary"
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  const isEditing = existingMembership && existingMembership.status_keaktifan === 'active';
  const nextTierProgress = getNextTierProgress(bookingCount);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
          <div className="px-6 py-5 flex items-center gap-4">
            <button 
              onClick={() => router.push('/pelanggan/dashboard')} 
              className="p-2 hover:bg-blue-700 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Kelola Membership' : 'Tambah Membership Baru'}
              </h1>
              <p className="text-blue-100 mt-1">
                {isEditing 
                  ? `Status saat ini: ${existingMembership.tier_membership} - Expired: ${new Date(existingMembership.expired_date).toLocaleDateString('id-ID')}`
                  : 'Daftar membership baru'
                }
              </p>
            </div>
            <Button
              onClick={reloadData}
              variant="secondary"
              size="sm"
              className="bg-blue-500 hover:bg-blue-400 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* NOTIFIKASI UPGRADE OTOMATIS */}
        {autoUpgradeAvailable && (
          <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Upgrade Otomatis Tersedia!</h3>
                  <p className="text-sm">
                    Anda memenuhi syarat untuk upgrade ke {recommendedTier} ({bookingCount} booking)
                  </p>
                </div>
              </div>
              <Button
                onClick={performAutoUpgrade}
                variant="primary"
                size="sm"
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold"
              >
                Upgrade Sekarang
              </Button>
            </div>
          </div>
        )}

        {/* INFORMASI BOOKING & PROGRESS */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Informasi Booking & Tier</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Booking Sukses:</span>
                  <span className="text-lg font-bold text-blue-700">{bookingCount} kali</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tier Direkomendasikan:</span>
                  <span className="text-lg font-bold text-green-700">{recommendedTier}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tier Saat Ini:</span>
                  <span className="text-lg font-bold text-purple-700">
                    {existingMembership ? existingMembership.tier_membership : 'Belum Ada Membership'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Progress Menuju Tier Berikutnya:</h3>
                
                {nextTierProgress.nextTier ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Menuju {nextTierProgress.nextTier}:</span>
                      <span className="font-medium">
                        {nextTierProgress.current}/{nextTierProgress.required} booking
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${nextTierProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Butuh {nextTierProgress.required! - nextTierProgress.current} booking lagi untuk upgrade otomatis ke {nextTierProgress.nextTier}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Anda sudah mencapai tier tertinggi!</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${bookingCount >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                    {bookingCount >= 5 ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>Gold: 5+ booking sukses (upgrade otomatis)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${bookingCount >= 15 ? 'text-green-600' : 'text-gray-500'}`}>
                    {bookingCount >= 15 ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>Platinum: 15+ booking sukses (upgrade otomatis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM MEMBERSHIP */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Membership
                  </label>
                  <input 
                    readOnly 
                    value={isEditing ? existingMembership.membership_id : generatedId} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Pelanggan
                  </label>
                  <input 
                    readOnly 
                    value={user.pengguna_id} 
                    className="w-full px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal {isEditing ? 'Perpanjangan' : 'Daftar'}
                  </label>
                  <input 
                    required 
                    type="date" 
                    name="tanggal_daftar" 
                    value={form.tanggal_daftar} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                  />
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier Membership
                  </label>
                  <select 
                    name="tier_membership" 
                    value={form.tier_membership} 
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition ${
                      !allowedTiers.includes(form.tier_membership) 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    {Object.entries(tierCriteria).map(([tier, criteria]) => (
                      <option 
                        key={tier} 
                        value={tier}
                        disabled={!allowedTiers.includes(tier)}
                        className={!allowedTiers.includes(tier) ? 'text-gray-400' : ''}
                      >
                        {tier} {!allowedTiers.includes(tier) && `(Butuh ${criteria.minBooking}+ booking)`}
                      </option>
                    ))}
                  </select>
                  
                  <div className="mt-2 space-y-1">
                    {!allowedTiers.includes(form.tier_membership) && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Anda belum memenuhi syarat untuk tier {form.tier_membership}. Butuh {tierCriteria[form.tier_membership as keyof typeof tierCriteria].minBooking}+ booking.
                      </p>
                    )}
                    {allowedTiers.includes(form.tier_membership) && form.tier_membership !== 'Silver' && (
                      <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Anda memenuhi syarat untuk upgrade ke {form.tier_membership}
                      </p>
                    )}
                    {allowedTiers.includes(form.tier_membership) && form.tier_membership === 'Silver' && (
                      <p className="text-blue-600 text-sm">
                        Tier Silver tersedia untuk semua pelanggan
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Expired
                  </label>
                  <input 
                    required 
                    type="date" 
                    name="expired_date" 
                    value={form.expired_date} 
                    onChange={handleChange} 
                    min={form.tanggal_daftar}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {durations.map(d => (
                      <button 
                        key={d.label} 
                        type="button" 
                        onClick={() => setExpiredDate(d.months)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition shadow-md"
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Membership
                  </label>
                  <input 
                    readOnly
                    value={form.expired_date ? (new Date(form.expired_date) < new Date() ? 'Kadaluarsa' : 'Aktif') : 'Pilih durasi'}
                    className={`w-full px-4 py-3 rounded-lg font-medium border ${
                      form.expired_date
                        ? new Date(form.expired_date) < new Date()
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`} 
                  />
                </div>
              </div>
            </div>

            {/* MANFAAT TIER */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
              <h3 className="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Manfaat {form.tier_membership}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tierCriteria[form.tier_membership as keyof typeof tierCriteria].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-amber-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* TOMBOL ACTION */}
            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="danger" 
                size="lg" 
                onClick={() => router.push('/pelanggan/dashboard')} 
                disabled={loading}
                className="px-8"
              >
                Batal
              </Button>
              
              {autoUpgradeAvailable && (
                <Button 
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={performAutoUpgrade}
                  className="px-8 bg-orange-500 hover:bg-orange-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Otomatis
                </Button>
              )}
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={loading || !allowedTiers.includes(form.tier_membership)}
                className="px-8 bg-green-500 hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : isEditing ? (
                  'Perpanjang/Upgrade Manual'
                ) : (
                  'Daftar Membership'
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
        customButtons={
          modalType === 'warning' && autoUpgradeAvailable ? (
            <div className="flex gap-3 mt-4">
              <Button
                variant="danger"
                onClick={handleModalClose}
                className="flex-1"
              >
                Nanti Saja
              </Button>
              <Button
                variant="primary"
                onClick={handleAutoUpgrade}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Otomatis
              </Button>
            </div>
          ) : undefined
        }
      />
    </>
  );
}