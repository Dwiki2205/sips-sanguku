// app/api/pelanggan/[id]/route.ts
import { NextResponse } from 'next/server';
import query from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'SELECT nama_lengkap FROM pelanggan WHERE pelanggan_id = $1',
      [params.id]
    );
    const nama = result.rows[0]?.nama_lengkap || 'Unknown';
    return NextResponse.json({ nama_lengkap: nama });
  } catch (error) {
    return NextResponse.json({ nama_lengkap: 'Unknown' }, { status: 500 });
  }
}