// Fallback database untuk development ketika Neon.tech down
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sips-dev.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const initSQL = `
    CREATE TABLE IF NOT EXISTS role (
      role_id TEXT PRIMARY KEY,
      role_name TEXT NOT NULL,
      permissions TEXT,
      deskripsi TEXT
    );

    CREATE TABLE IF NOT EXISTS pengguna (
      pengguna_id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      telepon TEXT,
      tanggal_bergabung DATETIME DEFAULT CURRENT_TIMESTAMP,
      role_id TEXT REFERENCES role(role_id)
    );

    CREATE TABLE IF NOT EXISTS pelanggan (
      pelanggan_id TEXT PRIMARY KEY,
      nama_lengkap TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      telepon TEXT,
      alamat TEXT,
      tanggal_registrasi DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking (
      booking_id TEXT PRIMARY KEY,
      pelanggan_id TEXT REFERENCES pelanggan(pelanggan_id),
      tanggal_booking DATE NOT NULL,
      jam_mulai TIME NOT NULL,
      jam_selesai TIME NOT NULL,
      status TEXT DEFAULT 'pending',
      total_biaya REAL NOT NULL,
      metode_pembayaran TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS membership (
      membership_id TEXT PRIMARY KEY,
      pelanggan_id TEXT REFERENCES pelanggan(pelanggan_id),
      tanggal_daftar DATE NOT NULL,
      status_keaktifan TEXT DEFAULT 'active',
      tier_membership TEXT DEFAULT 'Silver',
      expired_date DATE NOT NULL
    );
  `;

  // Execute initialization
  db.exec(initSQL, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('✅ Database initialized');
      insertDefaultData();
    }
  });
}

function insertDefaultData() {
  const defaultDataSQL = `
    INSERT OR IGNORE INTO role (role_id, role_name, permissions, deskripsi) VALUES
    ('R001', 'Owner', '["all"]', 'Pemilik usaha dengan akses penuh'),
    ('R002', 'Pegawai', '["view_booking","view_membership","search_booking","search_membership"]', 'Staff operasional'),
    ('R003', 'Pelanggan', '["add_booking","view_booking","add_membership","view_membership"]', 'Pelanggan biasa');

    INSERT OR IGNORE INTO pengguna (pengguna_id, nama, username, password, email, telepon, role_id) VALUES
    ('USR001', 'Pemilik Sanguku', 'owner', 'admin123', 'owner@sanguku.com', '081234567890', 'R001'),
    ('USR002', 'Staff Pegawai', 'pegawai', 'pegawai123', 'pegawai@sanguku.com', '081234567891', 'R002'),
    ('USR003', 'Pelanggan Demo', 'pelanggan', 'pelanggan123', 'pelanggan@sanguku.com', '081234567892', 'R003');

    INSERT OR IGNORE INTO pelanggan (pelanggan_id, nama_lengkap, username, password, email, telepon, alamat) VALUES
    ('PLG001', 'John Doe', 'johndoe', 'pelanggan123', 'john@email.com', '081234567892', 'Jl. Contoh No. 123, Yogyakarta'),
    ('PLG002', 'Jane Smith', 'janesmith', 'pelanggan123', 'jane@email.com', '081234567893', 'Jl. Test No. 456, Yogyakarta');

    INSERT OR IGNORE INTO booking (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, status, total_biaya, metode_pembayaran) VALUES
    ('BKG001', 'PLG001', '2024-01-15', '14:00', '16:00', 'confirmed', 100000, 'QRIS'),
    ('BKG002', 'PLG002', '2024-01-16', '10:00', '12:00', 'pending', 100000, 'Cash');

    INSERT OR IGNORE INTO membership (membership_id, pelanggan_id, tanggal_daftar, status_keaktifan, tier_membership, expired_date) VALUES
    ('MEM001', 'PLG001', '2024-01-01', 'active', 'Gold', '2024-12-31'),
    ('MEM002', 'PLG002', '2024-01-01', 'active', 'Silver', '2024-06-30');
  `;

  db.exec(defaultDataSQL, (err) => {
    if (err) {
      console.error('Error inserting default data:', err);
    } else {
      console.log('✅ Default data inserted');
    }
  });
}

// Promise wrapper untuk SQLite
export const devDB = {
  query: (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
    return new Promise((resolve, reject) => {
      console.log('🔧 Using Development Database - SQLite');
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [{ id: this.lastID }] });
          }
        });
      } else if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
        db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [{ changes: this.changes }] });
          }
        });
      } else {
        db.exec(sql, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [] });
          }
        });
      }
    });
  }
};