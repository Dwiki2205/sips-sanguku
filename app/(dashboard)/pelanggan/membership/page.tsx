// pelanggan/membership/page.tsx
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
    <div className="bg-gray-50 min-h-screen">
      {/* HEADER BIRU */}
      <div className="bg-blue-600 text-white px-6 py-5 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Syarat dan Ketentuan Membership
        </h1>
      </div>

      {/* KOTAK UTAMA */}
      <div className="p-4 mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">

          {/* JUDUL */}
          <div className="p-4 border-b bg-blue-50">
            <h2 className="text-2xl font-bold text-blue-600 text-center">
              Membership Sanguku (Gratis)
            </h2>
          </div>

          {/* ISI */}
          <div className="p-6 md:p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

            {/* TIER MEMBERSHIP */}
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-4">Tier Membership</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Silver */}
                <div className="border border-gray-300 rounded-xl p-5 bg-gray-50">
                  <h4 className="font-bold text-lg text-slate-700">Silver</h4>
                  <p className="text-2xl font-bold text-gray-600 mt-2">0 – 4 booking</p>
                  <p className="text-sm mt-2">Tier dasar. Wajib daftar manual setelah membuat akun & melengkapi data diri.</p>
                </div>

                {/* Gold */}
                <div className="border-2 border-yellow-400 rounded-xl p-5 bg-yellow-50 relative">
                  <h4 className="font-bold text-lg text-yellow-700">Gold</h4>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">5 – 14 booking</p>
                  <p className="text-sm mt-2">Upgrade manual setelah mencapai 5 booking sukses.</p>
                </div>

                {/* Platinum */}
                <div className="border-2 border-purple-500 rounded-xl p-5 bg-purple-50 relative">
                  <h4 className="font-bold text-lg text-purple-700">Platinum</h4>
                  <p className="text-3xl font-bold text-purple-600 mt-2">≥ 15 booking</p>
                  <p className="text-sm mt-2">Tier tertinggi. Upgrade manual setelah mencapai 15 booking sukses.</p>
                </div>
              </div>
            </div>

            {/* SYARAT UMUM */}
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-4">Syarat Umum Membership</h3>
              <ol className="space-y-4 list-decimal list-inside text-justify">
                <li>Tidak melakukan pelanggaran booking, seperti:
                  <ul className="ml-8 mt-2 space-y-1 list-disc">
                    <li>Tidak hadir (no-show) 2 kali berturut-turut tanpa pembatalan.</li>
                    <li>Merusak fasilitas lapangan atau peralatan.</li>
                    <li>Melakukan penyalahgunaan akun (multi-akun, fake booking, dll).</li>
                  </ul>
                </li>
                <li>Melakukan <strong>minimal 1 booking setiap 60 hari</strong> agar membership tetap aktif.</li>
                <li>Mematuhi seluruh aturan penggunaan lapangan, termasuk datang tepat waktu dan menjaga kebersihan.</li>
                <li>Pembatalan booking <strong>maksimal 6 jam sebelum jadwal</strong> untuk menghindari penalti.</li>
                <li><strong>Tidak meminjamkan atau mengalihkan akun membership</strong> kepada orang lain.</li>
                <li>Setiap upgrade tier dilakukan secara <strong>manual oleh member</strong> melalui sistem.</li>
                <li>Member bertanggung jawab untuk <strong>memantau jumlah booking</strong> dan melakukan upgrade ketika syarat terpenuhi.</li>
              </ol>
            </div>

            {/* INFO BOX */}
            <div className="mt-10 p-6 bg-blue-50 rounded-xl border-2 border-blue-300">
              <p className="text-center text-blue-900 font-semibold">
                Dengan menekan tombol "Lanjut ke Pendaftaran", Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan Membership Sanguku di atas, termasuk sistem upgrade manual.
              </p>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant="danger"
              size="lg"
              onClick={handleBatal}
              className="px-8 rounded-full order-2 sm:order-1"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLanjut}
              className="px-8 bg-green-500 hover:bg-green-600 rounded-full font-bold order-1 sm:order-2"
            >
              Lanjut ke Pendaftaran
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}