'use client';

import MembershipList from '@/components/membership/MembershipList';

export default function PegawaiMembershipPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Membership</h1>
      </div>

      <MembershipList showActions={false} />
    </div>
  );
}