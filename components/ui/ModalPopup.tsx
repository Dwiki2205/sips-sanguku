// components/ui/ModalPopup.tsx
import { X } from 'lucide-react';
import { ReactNode } from 'react';

type ModalType = 'success' | 'warning' | 'error';

interface ModalPopupProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message?: string;
  onClose: () => void;
  customButtons?: ReactNode; // Tambahkan prop customButtons
}

const iconMap = {
  success: (
    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.94 4h13.88a1.88 1.88 0 001.68-2.75L13.06 3.2a1.88 1.88 0 00-3.36 0L3.12 16.25A1.88 1.88 0 004.8 19z" />
    </svg>
  ),
  error: (
    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const bgColorMap = {
  success: 'bg-green-100',
  warning: 'bg-orange-100', 
  error: 'bg-red-100',
};

const buttonColorMap = {
  success: 'bg-blue-600 hover:bg-blue-700',
  warning: 'bg-orange-600 hover:bg-orange-700',
  error: 'bg-red-600 hover:bg-red-700',
};

export default function ModalPopup({ 
  isOpen, 
  type, 
  title, 
  message, 
  onClose, 
  customButtons 
}: ModalPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center mt-2 space-y-4">
          <div className={`rounded-full p-4 ${bgColorMap[type]}`}>
            {iconMap[type]}
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-gray-800">
              {title}
            </h2>
            {message && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Tampilkan custom buttons jika ada, jika tidak tampilkan tombol default */}
          {customButtons ? (
            <div className="w-full">
              {customButtons}
            </div>
          ) : (
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-lg font-medium text-white transition ${buttonColorMap[type]}`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}