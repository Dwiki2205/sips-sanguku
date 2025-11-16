// app/(dashboard)/manager/laporan/pendapatan/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface PendapatanData {
  tanggal: string;
  unit_bisnis: string;
  metode_pembayaran: string;
  sub_total: number;
  jumlah_transaksi: number;
}

interface FilterState {
  startDate: string;
  endDate: string;
  metodePembayaran: string;
  unitBisnis: string;
}

export default function LaporanPendapatanPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    startDate: '',
    endDate: '',
    metodePembayaran: 'all',
    unitBisnis: 'all'
  });

  // Data states
  const [pendapatanData, setPendapatanData] = useState<PendapatanData[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    metodePembayaran: [] as string[],
    unitBisnis: [] as string[]
  });

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [filter]);

  // Load filter options saat pertama kali render
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/laporan/options');
      const result = await response.json();
      
      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.metodePembayaran !== 'all') params.append('metodePembayaran', filter.metodePembayaran);
      if (filter.unitBisnis !== 'all') params.append('unitBisnis', filter.unitBisnis);
      
      const response = await fetch(`/api/laporan/pendapatan?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('Data received:', result.data);
        setPendapatanData(result.data);
      } else {
        setError(result.error || 'Gagal mengambil data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Fungsi untuk menghitung total dengan aman
  const calculateTotals = () => {
    if (!pendapatanData || pendapatanData.length === 0) {
      return { totalPendapatan: 0, totalTransaksi: 0 };
    }

    const totalPendapatan = pendapatanData.reduce((sum, item) => {
      const amount = typeof item.sub_total === 'number' ? item.sub_total : 
                    typeof item.sub_total === 'string' ? parseFloat(item.sub_total) : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalTransaksi = pendapatanData.reduce((sum, item) => {
      const count = typeof item.jumlah_transaksi === 'number' ? item.jumlah_transaksi : 
                   typeof item.jumlah_transaksi === 'string' ? parseInt(item.jumlah_transaksi) : 0;
      return sum + (isNaN(count) ? 0 : count);
    }, 0);

    return { totalPendapatan, totalTransaksi };
  };

  const { totalPendapatan, totalTransaksi } = calculateTotals();

  // Pagination
  const totalPages = Math.ceil(pendapatanData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = pendapatanData.slice(startIndex, startIndex + itemsPerPage);

  // PERBAIKAN: Syntax error di formatCurrency - hapus kurung salah
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('Rp', 'Rp ');
  };

  const formatNumber = (num: number) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Fungsi untuk download Excel
  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.metodePembayaran !== 'all') params.append('metodePembayaran', filter.metodePembayaran);
      if (filter.unitBisnis !== 'all') params.append('unitBisnis', filter.unitBisnis);
      params.append('download', 'true');
      
      const response = await fetch(`/api/laporan/pendapatan?${params.toString()}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan-Pendapatan-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Excel:', err);
      alert('Gagal mengunduh laporan');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilter = () => {
    setFilter({
      startDate: '',
      endDate: '',
      metodePembayaran: 'all',
      unitBisnis: 'all'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        {/* Header Section dengan Total Pendapatan */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Laporan Pendapatan</h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="px-6 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                {(filter.metodePembayaran !== 'all' || filter.unitBisnis !== 'all' || filter.startDate || filter.endDate) && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(filter.metodePembayaran !== 'all' ? 1 : 0) + 
                     (filter.unitBisnis !== 'all' ? 1 : 0) + 
                     (filter.startDate ? 1 : 0) + 
                     (filter.endDate ? 1 : 0)}
                  </span>
                )}
              </button>
              <button 
                onClick={downloadExcel}
                disabled={loading}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-lg flex items-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </button>
            </div>
          </div>

          {/* Total Pendapatan Card */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Total Pendapatan</h2>
                <p className="text-sm text-gray-600">Total keseluruhan pendapatan</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-700">
                  {formatCurrency(totalPendapatan)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  dari {formatNumber(totalTransaksi)} Transaksi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filter Data
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={resetFilter}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset Filter
                </button>
                <button 
                  onClick={fetchData}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium"
                >
                  Terapkan
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter Tanggal Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Tanggal Akhir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Metode Pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={filter.metodePembayaran}
                  onChange={(e) => handleFilterChange('metodePembayaran', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Metode</option>
                  {filterOptions.metodePembayaran.map(metode => (
                    <option key={metode} value={metode}>{metode}</option>
                  ))}
                </select>
              </div>

              {/* Filter Unit Bisnis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Bisnis
                </label>
                <select
                  value={filter.unitBisnis}
                  onChange={(e) => handleFilterChange('unitBisnis', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Unit</option>
                  {filterOptions.unitBisnis.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-bold text-blue-600">{formatNumber(pendapatanData.length)}</span> transaksi
                {loading && <span className="ml-2 text-blue-500">Memuat data...</span>}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data pendapatan...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <p className="text-red-800 font-medium mb-2">Gagal memuat data</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <>
            {/* Kondisi jika tidak ada data */}
            {pendapatanData.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-medium text-gray-600">Tidak ada data pendapatan</p>
                <p className="text-sm text-gray-500 mt-2">
                  {Object.values(filter).some(val => val !== '' && val !== 'all') 
                    ? 'Coba ubah filter atau reset untuk melihat semua data'
                    : 'Belum ada transaksi pendapatan'}
                </p>
                {(filter.startDate || filter.endDate || filter.metodePembayaran !== 'all' || filter.unitBisnis !== 'all') && (
                  <button
                    onClick={resetFilter}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Tabel Pendapatan */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-900">
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                            Tanggal
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                            Unit Bisnis
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                            Metode Pembayaran
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                            Jumlah Transaksi
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide">
                            Total Pendapatan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {currentData.map((item, index) => {
                          const jumlahTransaksi = typeof item.jumlah_transaksi === 'number' 
                            ? item.jumlah_transaksi 
                            : parseInt(item.jumlah_transaksi) || 0;
                          
                          const subTotal = typeof item.sub_total === 'number'
                            ? item.sub_total
                            : parseFloat(item.sub_total) || 0;

                          return (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {formatDate(item.tanggal)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-blue-700">
                                {item.unit_bisnis}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.metode_pembayaran === 'QRIS' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.metode_pembayaran}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {formatNumber(jumlahTransaksi)} transaksi
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                {formatCurrency(subTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`text-sm font-medium transition-colors ${
                          currentPage === 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-700 hover:text-blue-800'
                        }`}
                      >
                        &lt; Prev
                      </button>
                      <span className="text-sm text-gray-600">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`text-sm font-medium transition-colors ${
                          currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-700 hover:text-blue-800'
                        }`}
                      >
                        Next &gt;
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}