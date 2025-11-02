-- Tabel Role
CREATE TABLE IF NOT EXISTS role (
    role_id VARCHAR(5) PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL,
    permissions TEXT,
    deskripsi VARCHAR(100)
);

-- Tabel Pengguna
CREATE TABLE IF NOT EXISTS pengguna (
    pengguna_id VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50),
    telepon VARCHAR(15),
    tanggal_bergabung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id VARCHAR(5) REFERENCES role(role_id)
);

-- Tabel Pelanggan
CREATE TABLE IF NOT EXISTS pelanggan (
    pelanggan_id VARCHAR(10) PRIMARY KEY,
    nama_lengkap VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50),
    telepon VARCHAR(15),
    alamat TEXT,
    tanggal_registrasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Membership
CREATE TABLE IF NOT EXISTS membership (
    membership_id VARCHAR(10) PRIMARY KEY,
    pelanggan_id VARCHAR(10) REFERENCES pelanggan(pelanggan_id),
    tanggal_daftar DATE DEFAULT CURRENT_DATE,
    status_keaktifan VARCHAR(10) DEFAULT 'Aktif',
    tier_membership VARCHAR(10) DEFAULT 'Silver',
    expired_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Booking
CREATE TABLE IF NOT EXISTS booking (
    booking_id VARCHAR(10) PRIMARY KEY,
    pelanggan_id VARCHAR(10) REFERENCES pelanggan(pelanggan_id),
    tanggal_booking DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    jenis_layanan VARCHAR(20) NOT NULL,
    status VARCHAR(15) DEFAULT 'Pending',
    total_biaya DECIMAL(10,2) NOT NULL,
    metode_pembayaran VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO role (role_id, role_name, permissions, deskripsi) VALUES
('R001', 'Owner', '["all"]', 'Pemilik usaha dengan akses penuh'),
('R002', 'Pegawai', '["view_booking","view_membership","search_booking","search_membership"]', 'Staff operasional'),
('R003', 'Pelanggan', '["add_booking","view_booking","add_membership","view_membership"]', 'Pelanggan biasa')
ON CONFLICT (role_id) DO NOTHING;

-- Insert default users
INSERT INTO pengguna (pengguna_id, nama, username, password, email, telepon, role_id) VALUES
('USR001', 'Pemilik Sanguku', 'owner', 'admin123', 'owner@sanguku.com', '081234567890', 'R001'),
('USR002', 'Staff Pegawai', 'pegawai', 'pegawai123', 'pegawai@sanguku.com', '081234567891', 'R002')
ON CONFLICT (pengguna_id) DO NOTHING;

-- Insert sample pelanggan
INSERT INTO pelanggan (pelanggan_id, nama_lengkap, username, password, email, telepon, alamat) VALUES
('PLG001', 'Budi Santoso', 'budi', 'budi123', 'budi@email.com', '081234567892', 'Jl. Merdeka No. 123, Yogyakarta'),
('PLG002', 'Sari Indah', 'sari', 'sari123', 'sari@email.com', '081234567893', 'Jl. Sudirman No. 45, Yogyakarta'),
('PLG003', 'Ahmad Wijaya', 'ahmad', 'ahmad123', 'ahmad@email.com', '081234567894', 'Jl. Malioboro No. 78, Yogyakarta')
ON CONFLICT (pelanggan_id) DO NOTHING;

-- Insert sample membership
INSERT INTO membership (membership_id, pelanggan_id, tier_membership, expired_date) VALUES
('MEM001', 'PLG001', 'Gold', '2024-12-31'),
('MEM002', 'PLG002', 'Silver', '2024-11-30'),
('MEM003', 'PLG003', 'Bronze', '2024-10-31')
ON CONFLICT (membership_id) DO NOTHING;

-- Insert sample bookings
INSERT INTO booking (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, jenis_layanan, status, total_biaya, metode_pembayaran) VALUES
('BKG001', 'PLG001', '2024-01-15', '14:00:00', '16:00:00', 'Lapangan Badminton', 'Confirmed', 100000, 'QRIS'),
('BKG002', 'PLG002', '2024-01-15', '16:00:00', '18:00:00', 'Lapangan Badminton', 'Pending', 100000, 'Cash'),
('BKG003', 'PLG003', '2024-01-16', '10:00:00', '12:00:00', 'Rental PS', 'Completed', 50000, 'QRIS'),
('BKG004', 'PLG001', '2024-01-16', '18:00:00', '20:00:00', 'Lapangan Badminton', 'Confirmed', 120000, 'Debit'),
('BKG005', 'PLG002', '2024-01-17', '09:00:00', '11:00:00', 'Rental PS', 'Cancelled', 50000, NULL)
ON CONFLICT (booking_id) DO NOTHING;