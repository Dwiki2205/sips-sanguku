//pelanggan/membership/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function MembershipTncPage() {
  const router = useRouter();

  const handleLanjut = () => {
    router.push('/pelanggan/membership/new');
  };

  const handleBatal = () => {
    router.push('/pelanggan/dashboard');
  };

  return (
    <div className="bg-gray-50">
      {/* HEADER BIRU - FULL WIDTH */}
      <div className="bg-blue-600 text-white px-6 py-5 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Syarat dan Ketentuan Membership
        </h1>
      </div>

      {/* KOTAK PUTIH - FULL WIDTH */}
      <div className="flex-1 p-2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          {/* JUDUL */}
          <div className="p-4 border-b bg-blue-50">
            <h2 className="text-2xl font-bold text-blue-600 text-center">
              Membership Sanguku
            </h2>
          </div>

          {/* SYARAT - RATA KIRI KANAN */}
          <div className="p-8 space-y-6 text-gray-700 text-sm leading-relaxed text-justify">
            <ol className="space-y-6">
              <li>
                <strong className="text-lg">1.</strong> Membership bersifat gratis dan dapat didaftarkan oleh seluruh pelanggan tanpa biaya.
              </li>
              <li>
                <strong className="text-lg">2.</strong> Anggota wajib mengisi data diri yang valid dan menjaga kerahasiaan informasi.
              </li>
              <li>
                <strong className="text-lg">3.</strong> Membership digunakan untuk kemudahan booking serta pencatatan riwayat bermain.
              </li>
              <li>
                <strong className="text-lg">4.</strong> Keanggotaan tidak dapat dipindah tangankan dan wajib mematuhi seluruh peraturan lapangan.
              </li>
              <li>
                <strong className="text-lg">5.</strong> Pengelola berhak menonaktifkan membership jika ditemukan penyalahgunaan atau pelanggaran aturan.
              </li>
            </ol>

            {/* KOTAK INFO */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-medium text-center">
                Dengan melanjutkan, Anda menyatakan telah membaca dan menyetujui seluruh syarat di atas.
              </p>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
            <Button
              variant="danger"
              size="lg"
              onClick={handleBatal}
              className="px-8 rounded-full"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLanjut}
              className="px-8 bg-green-500 hover:bg-green-600 rounded-full font-bold"
            >
              Lanjut ke Pendaftaran
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}