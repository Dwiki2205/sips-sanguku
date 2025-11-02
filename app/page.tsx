import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SIPS</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistem Informasi Pengelolaan Sanguku
        </p>
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/registrasi" 
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Daftar Akun Baru
          </Link>
        </div>
        
        {/* Demo Accounts Info */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Akun Demo:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Owner:</strong> owner / admin123</div>
            <div><strong>Pegawai:</strong> pegawai / pegawai123</div>
          </div>
        </div>
      </div>
    </div>
  )
}