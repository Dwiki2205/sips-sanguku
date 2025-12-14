// app/(dashboard)/owner/upload-sips/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import ModalPopup from '@/components/ui/ModalPopup';

interface UploadHistory {
  id: number;
  filename: string;
  upload_time: string;
  status: string;
  records_imported: number;
  message: string;
}

export default function UploadSIPSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: '',
  });

  // Riwayat upload state
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch riwayat upload
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/upload-sips');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        console.error('Gagal fetch riwayat');
      }
    } catch (err) {
      console.error('Error fetch riwayat:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validName = /^sips_pelanggan_\d{8}_\d{4}\.csv$/.test(selected.name);
    if (!validName) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Format Nama File Salah!',
        message: `Nama file harus: sips_pelanggan_YYYYMMDD_HHMM.csv\n\nContoh: sips_pelanggan_20251125_2300.csv\n\nFile kamu: ${selected.name}`,
      });
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selected);
    setResult('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-sips', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setResult('success');
        setMessage(json.message || 'File berhasil diunggah!');

        // TAMPILKAN POPUP SUCCESS
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Upload Berhasil!',
          message: `File <strong>${file.name}</strong> berhasil di-upload dan data sudah masuk ke database Neon.\n\nFile juga akan dikirim otomatis ke CRM malam ini pukul 23:00 WIB.`,
        });

        // Refetch riwayat setelah sukses
        await fetchHistory();

        // Reset form
        setFile(null);
        (document.getElementById('file-input') as HTMLInputElement).value = '';
      } else {
        setResult('error');
        setMessage(json.error || 'Gagal mengunggah file');

        setModal({
          isOpen: true,
          type: 'error',
          title: 'Upload Gagal',
          message: json.error || 'Terjadi kesalahan saat mengunggah file. Silakan coba lagi.',
        });
      }
    } catch (err) {
      setResult('error');
      setMessage('Koneksi bermasalah');

      setModal({
        isOpen: true,
        type: 'error',
        title: 'Koneksi Gagal',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      });
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Upload className="w-8 h-8" />
              Upload File SIPS ke CRM
            </h1>
            <p className="mt-2 text-blue-100">
              Sesuai ADUH_Spesifikasi Teknologi & Integrasi POS (INT-SIPS-CRM-001)
            </p>
          </div>

          <div className="p-8">
            {/* Informasi Wajib */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900">Ketentuan Upload (WAJIB DIPATUHI)</h3>
                  <ul className="mt-2 text-sm text-amber-800 space-y-1">
                    <li>• Nama file: <code className="bg-amber-200 px-2 py-1 rounded">sips_pelanggan_YYYYMMDD_HHMM.csv</code></li>
                    <li>• Contoh: <code className="bg-amber-200 px-2 py-1 rounded">sips_pelanggan_20251125_2300.csv</code></li>
                    <li>• Upload manual hanya untuk testing / emergency</li>
                    <li>• Upload otomatis tetap jalan tiap hari pukul 23:00 WIB via cron</li>
                    <li>• File akan divalidasi ketat oleh server CRM</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <input
                id="file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div>
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Drag & drop file CSV di sini, atau</p>
                  <Button
                    size="lg"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Pilih File CSV
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-lg font-semibold">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ukuran: {(file.size / 1024).toFixed(2)} KB
                  </p>

                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Mengunggah...' : 'Upload ke Server'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setResult('idle');
                        (document.getElementById('file-input') as HTMLInputElement).value = '';
                      }}
                      disabled={uploading}
                    >
                      Batal
                    </Button>
                  </div>

                  {uploading && (
                    <p className="text-blue-600 flex items-center gap-2 justify-center mt-4">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Sedang mengunggah dan mengimpor data...
                    </p>
                  )}

                  {result === 'success' && !modal.isOpen && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      {message}
                    </div>
                  )}

                  {result === 'error' && !modal.isOpen && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      {message}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-500 text-center">
              Upload otomatis terjadwal: <strong>Setiap hari pukul 23:00 WIB</strong>
            </div>

            {/* Tabel Riwayat Upload */}
            <div className="mt-12">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                Riwayat Upload
              </h2>
              {loadingHistory ? (
                <p className="text-center text-gray-500">Memuat riwayat...</p>
              ) : history.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada riwayat upload.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama File</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Upload</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Record</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.filename}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.upload_time).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.records_imported}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POPUP (Success / Error) */}
      <ModalPopup
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
}