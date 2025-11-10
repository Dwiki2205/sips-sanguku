'use client';

import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  type,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-16 h-16 text-green-500" />,
    warning: <AlertCircle className="w-16 h-16 text-orange-500" />,
    error: <AlertCircle className="w-16 h-16 text-red-500" />,
  };

  const buttonColors = {
    success: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-orange-500 hover:bg-orange-600',
    error: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full text-center">
        {/* Icon */}
        <div className="flex justify-center -mt-8">
          <div className="bg-white rounded-full p-4 shadow-lg">
            {icons[type]}
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 pb-8 px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
          <div className="text-gray-600 text-sm">{children}</div>
        </div>

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${buttonColors[type]}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}