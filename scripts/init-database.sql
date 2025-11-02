-- =============================================
-- SIPS Database Schema
-- Sistem Informasi Pengelolaan Sanguku
-- =============================================

-- Hapus tables jika sudah ada (untuk reset)
DROP TABLE IF EXISTS membership CASCADE;
DROP TABLE IF EXISTS booking CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;
DROP TABLE IF EXISTS pengguna CASCADE;
DROP TABLE IF EXISTS role CASCADE;

-- =============================================
-- TABLE: role
-- Menyimpan data role pengguna
-- =============================================
CREATE TABLE role (
    role_id VARCHAR(5) PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL,
    permissions TEXT,
    deskripsi VARCHAR(100)
);

-- =============================================
-- TABLE: pengguna
-- Menyimpan data pengguna sistem (owner & pegawai)
-- =============================================
CREATE TABLE pengguna (
    pengguna_id VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50),
    telepon VARCHAR(15),
    tanggal_bergabung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id VARCHAR(5) REFERENCES role(role_id)
);

-- =============================================
-- TABLE: pelanggan
-- Menyimpan data pelanggan
-- =============================================
CREATE TABLE pelanggan (
    pelanggan_id VARCHAR(10) PRIMARY KEY,
    nama_lengkap VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50),
    telepon VARCHAR(15),
    alamat TEXT,
    tanggal_registrasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: booking
-- Menyimpan data booking lapangan
-- =============================================
CREATE TABLE booking (
    booking_id VARCHAR(10) PRIMARY KEY,
    pelanggan_id VARCHAR(10) REFERENCES pelanggan(pelanggan_id),
    tanggal_booking DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    status VARCHAR(15) DEFAULT 'pending',
    total_biaya DECIMAL(10,2) NOT NULL,
    metode_pembayaran VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: membership
-- Menyimpan data membership pelanggan
-- =============================================
CREATE TABLE membership (
    membership_id VARCHAR(10) PRIMARY KEY,
    pelanggan_id VARCHAR(10) REFERENCES pelanggan(pelanggan_id),
    tanggal_daftar DATE NOT NULL,
    status_keaktifan VARCHAR(10) DEFAULT 'active',
    tier_membership VARCHAR(10) DEFAULT 'Silver',
    expired_date DATE NOT NULL
);

-- =============================================
-- TABLE: password_reset_tokens
-- Untuk fitur lupa password
-- =============================================
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default roles
INSERT INTO role (role_id, role_name, permissions, deskripsi) VALUES
('R001', 'Owner', '["all"]', 'Pemilik usaha dengan akses penuh'),
('R002', 'Pegawai', '["view_booking","view_membership","search_booking","search_membership"]', 'Staff operasional'),
('R003', 'Pelanggan', '["add_booking","view_booking","add_membership","view_membership"]', 'Pelanggan biasa');

-- Insert default users (password dalam plain text untuk development)
INSERT INTO pengguna (pengguna_id, nama, username, password, email, telepon, role_id) VALUES
('USR001', 'Pemilik Sanguku', 'owner', 'admin123', 'owner@sanguku.com', '081234567890', 'R001'),
('USR002', 'Staff Pegawai 1', 'pegawai', 'pegawai123', 'pegawai1@sanguku.com', '081234567891', 'R002'),
('USR003', 'Manager Operasional', 'manager', 'manager123', 'manager@sanguku.com', '081234567892', 'R002');

-- Insert sample pelanggan
INSERT INTO pelanggan (pelanggan_id, nama_lengkap, username, password, email, telepon, alamat) VALUES
('PLG001', 'Budi Santoso', 'budi', 'pelanggan123', 'budi@email.com', '081234567893', 'Jl. Merdeka No. 123, Yogyakarta'),
('PLG002', 'Sari Indah', 'sari', 'pelanggan123', 'sari@email.com', '081234567894', 'Jl. Sudirman No. 45, Yogyakarta'),
('PLG003', 'Ahmad Wijaya', 'ahmad', 'pelanggan123', 'ahmad@email.com', '081234567895', 'Jl. Malioboro No. 67, Yogyakarta'),
('PLG004', 'Dewi Lestari', 'dewi', 'pelanggan123', 'dewi@email.com', '081234567896', 'Jl. Pasar Kembang No. 89, Yogyakarta'),
('PLG005', 'Rizki Pratama', 'rizki', 'pelanggan123', 'rizki@email.com', '081234567897', 'Jl. Solo No. 101, Yogyakarta');

-- Insert sample bookings
INSERT INTO booking (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, status, total_biaya, metode_pembayaran) VALUES
('BKG001', 'PLG001', '2024-01-15', '14:00', '16:00', 'confirmed', 150000, 'QRIS'),
('BKG002', 'PLG002', '2024-01-15', '16:00', '18:00', 'confirmed', 150000, 'Cash'),
('BKG003', 'PLG003', '2024-01-16', '09:00', '11:00', 'pending', 120000, 'Transfer'),
('BKG004', 'PLG001', '2024-01-17', '19:00', '21:00', 'confirmed', 180000, 'QRIS'),
('BKG005', 'PLG004', '2024-01-18', '13:00', '15:00', 'cancelled', 150000, 'Cash');

-- Insert sample memberships
INSERT INTO membership (membership_id, pelanggan_id, tanggal_daftar, status_keaktifan, tier_membership, expired_date) VALUES
('MEM001', 'PLG001', '2024-01-01', 'active', 'Gold', '2024-12-31'),
('MEM002', 'PLG002', '2024-01-01', 'active', 'Silver', '2024-06-30'),
('MEM003', 'PLG003', '2024-01-01', 'active', 'Platinum', '2024-12-31'),
('MEM004', 'PLG004', '2023-12-01', 'expired', 'Silver', '2023-12-31'),
('MEM005', 'PLG005', '2024-01-15', 'active', 'Gold', '2024-07-15');

-- =============================================
-- CREATE INDEXES untuk performa
-- =============================================

-- Index untuk pencarian cepat
CREATE INDEX idx_booking_pelanggan_id ON booking(pelanggan_id);
CREATE INDEX idx_booking_tanggal ON booking(tanggal_booking);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_membership_pelanggan_id ON membership(pelanggan_id);
CREATE INDEX idx_membership_status ON membership(status_keaktifan);
CREATE INDEX idx_membership_expired ON membership(expired_date);
CREATE INDEX idx_pengguna_username ON pengguna(username);
CREATE INDEX idx_pelanggan_username ON pelanggan(username);

-- =============================================
-- CREATE VIEWS untuk reporting
-- =============================================

-- View untuk laporan booking harian
CREATE VIEW view_booking_harian AS
SELECT 
    b.booking_id,
    p.nama_lengkap,
    b.tanggal_booking,
    b.jam_mulai,
    b.jam_selesai,
    b.status,
    b.total_biaya,
    b.metode_pembayaran
FROM booking b
JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
ORDER BY b.tanggal_booking DESC, b.jam_mulai DESC;

-- View untuk laporan membership aktif
CREATE VIEW view_membership_aktif AS
SELECT 
    m.membership_id,
    p.nama_lengkap,
    p.email,
    p.telepon,
    m.tier_membership,
    m.tanggal_daftar,
    m.expired_date,
    m.status_keaktifan
FROM membership m
JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
WHERE m.status_keaktifan = 'active'
ORDER BY m.expired_date ASC;

-- View untuk dashboard statistics
CREATE VIEW view_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM booking WHERE status = 'confirmed') as total_booking_aktif,
    (SELECT COUNT(*) FROM membership WHERE status_keaktifan = 'active') as total_membership_aktif,
    (SELECT COUNT(*) FROM pelanggan) as total_pelanggan,
    (SELECT COALESCE(SUM(total_biaya), 0) FROM booking WHERE status = 'confirmed') as total_pendapatan;

-- =============================================
-- CREATE FUNCTIONS untuk business logic
-- =============================================

-- Function untuk mengecek ketersediaan jadwal
CREATE OR REPLACE FUNCTION check_jadwal_ketersediaan(
    p_tanggal DATE,
    p_jam_mulai TIME,
    p_jam_selesai TIME
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM booking 
        WHERE tanggal_booking = p_tanggal 
        AND status IN ('confirmed', 'pending')
        AND (
            (p_jam_mulai BETWEEN jam_mulai AND jam_selesai) OR
            (p_jam_selesai BETWEEN jam_mulai AND jam_selesai) OR
            (jam_mulai BETWEEN p_jam_mulai AND p_jam_selesai)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function untuk memperpanjang membership
CREATE OR REPLACE FUNCTION perpanjang_membership(
    p_membership_id VARCHAR(10),
    p_bulan_tambahan INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE membership 
    SET expired_date = expired_date + (p_bulan_tambahan || ' months')::INTERVAL,
        updated_at = CURRENT_TIMESTAMP
    WHERE membership_id = p_membership_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS untuk auto-update
-- =============================================

-- Trigger untuk auto-update updated_at pada booking
CREATE OR REPLACE FUNCTION update_booking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_timestamp
    BEFORE UPDATE ON booking
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_timestamp();

-- =============================================
-- GRANT PERMISSIONS (jika menggunakan user khusus)
-- =============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sips_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sips_user;

-- =============================================
-- CONFIRM DATA INSERTED
-- =============================================
SELECT '✅ Database SIPS berhasil diinisialisasi' as status;

-- Tampilkan summary data
SELECT 
    (SELECT COUNT(*) FROM role) as total_roles,
    (SELECT COUNT(*) FROM pengguna) as total_pengguna,
    (SELECT COUNT(*) FROM pelanggan) as total_pelanggan,
    (SELECT COUNT(*) FROM booking) as total_booking,
    (SELECT COUNT(*) FROM membership) as total_membership;