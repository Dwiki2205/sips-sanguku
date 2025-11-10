'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function PelangganDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Selamat Datang, {user?.nama}!
        </h2>
        <p className="text-gray-600 mb-4">
          Anda login sebagai <strong>Pelanggan</strong>. Anda memiliki akses untuk booking dan membership.
        </p>
        
          </div>
        </div>
  );
}