// app/(dashboard)/owner/membership/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MembershipDetails from '@/components/membership/MembershipDetails';
import { Membership } from '@/types/membership';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OwnerMembershipPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filtered, setFiltered] = useState<Membership[]>([]);
  const [selected, setSelected] = useState<Membership | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 6;

  // === FETCH DATA DENGAN PAGINATION & SEARCH ===
  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(
        `/api/membership?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setMemberships(json.data);
        setFiltered(json.data);
        setTotal(json.pagination?.total || 0);
        
        // Reset selected ketika data berubah
        setSelected(null);
      } else {
        console.error('Invalid response:', json);
        setMemberships([]);
        setFiltered([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Gagal memuat data membership');
      setMemberships([]);
      setFiltered([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // === EFFECT: Reload saat page/search berubah ===
  useEffect(() => {
    fetchMemberships();
  }, [page, search]);

  // === FUNGSI SELECT/UNSELECT ===
  const handleSelectMembership = (membership: Membership) => {
    if (selected?.membership_id === membership.membership_id) {
      // Unselect jika membership yang sama diklik
      setSelected(null);
    } else {
      // Select membership baru
      setSelected(membership);
    }
  };

  // Fungsi untuk unselect secara eksplisit
  const handleUnselect = () => {
    setSelected(null);
  };

  // === UTILS ===
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER & SEARCH */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Membership</h1>
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Cari nama, email, ID, atau tier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* GRID: LIST + DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAFTAR MEMBERSHIP */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Daftar Membership</h2>
              <p className="text-xs opacity-90">
                Total: {total} | Halaman {page} dari {totalPages}
              </p>
            </div>
            {selected && (
              <button
                onClick={handleUnselect}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded transition-colors"
                title="Unselect membership"
              >
                Unselect
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="font-medium">Tidak ada membership ditemukan</p>
                <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.membership_id}
                  onClick={() => handleSelectMembership(m)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-blue-50 relative ${
                    selected?.membership_id === m.membership_id
                      ? 'bg-blue-100 border-l-4 border-blue-600 ring-2 ring-blue-200'
                      : ''
                  }`}
                >
                  {/* AVATAR */}
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                    {getInitials(m.nama_lengkap)}
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        #{m.membership_id}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                          m.tier_membership === 'Platinum'
                            ? 'bg-purple-600'
                            : m.tier_membership === 'Gold'
                            ? 'bg-yellow-600'
                            : 'bg-gray-500'
                        }`}
                      >
                        {m.tier_membership}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 truncate">{m.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">
                      Exp:{' '}
                      {new Date(m.expired_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* SELECTION INDICATOR */}
                  {selected?.membership_id === m.membership_id && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev || loading}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-sm text-gray-600 font-medium">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || loading}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* DETAIL MEMBERSHIP */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {selected ? `Detail Membership #${selected.membership_id}` : 'Detail Membership'}
            </h2>
          </div>

          <div className="p-6">
            {selected ? (
              <MembershipDetails membership={selected} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Tidak ada membership yang dipilih
                </h3>
                <p className="text-sm mb-4">Pilih membership dari daftar untuk melihat detail</p>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}