// app/(dashboard)/owner/upload-sips/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import ModalPopup from '@/components/ui/ModalPopup';

interface UploadHistoryItem {
  id: string;
  filename: string;
  uploadTime: string; // Format: YYYY-MM-DD HH:MM:SS
  status: 'success' | 'error';
  message?: string;
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
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch riwayat upload saat komponen mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/upload-sips-history');
        const json = await res.json();
        if (res.ok && json.success) {
          // Filter hanya yang berhasil (status 'success')
          const successfulUploads = json.data.filter((item: UploadHistoryItem) => item.status === 'success');
          setHistory(successfulUploads);
        } else {
          console.error('Gagal fetch riwayat:', json.error);
        }
      } catch (err) {
        console.error('Error fetch riwayat:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

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

        // Refresh riwayat setelah upload berhasil
        const historyRes = await fetch('/api/upload-sips-history');
        const historyJson = await historyRes.json();
        if (historyRes.ok && historyJson.success) {
          const successfulUploads = historyJson.data.filter((item: UploadHistoryItem) => item.status === 'success');
          setHistory(successfulUploads);
        }

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

            {/* Tabel Riwayat Upload */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">Riwayat Upload Berhasil</h2>
              {loadingHistory ? (
                <p className="text-gray-600">Memuat riwayat...</p>
              ) : history.length === 0 ? (
                <p className="text-gray-600">Belum ada riwayat upload berhasil.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Nama File</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Waktu Upload</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Pesan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">{item.filename}</td>
                          <td className="py-3 px-4">{item.uploadTime}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Berhasil
                            </span>
                          </td>
                          <td className="py-3 px-4">{item.message || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-500 text-center">
              Upload otomatis terjadwal: <strong>Setiap hari pukul 23:00 WIB</strong>
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