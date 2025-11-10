// // lib/db-dev.ts
// import path from 'path';
// import type { Database, RunResult } from 'sqlite3';

// let db: Database | null = null;
// let initialized = false;

// // Hanya jalankan di development
// async function ensureDatabase(): Promise<Database> {
//   if (db && initialized) return db;

//   if (process.env.NODE_ENV !== 'development') {
//     throw new Error('SQLite dev database hanya tersedia di mode development');
//   }

//   try {
//     // Dynamic import → tidak di-bundle di production
//     const sqlite3 = await import('sqlite3');
//     const sqlite = sqlite3.verbose();
//     const dbPath = path.join(process.cwd(), 'sips-dev.db');

//     return new Promise<Database>((resolve, reject) => {
//       const database = new sqlite.Database(dbPath, (err: Error | null) => {
//         if (err) {
//           console.error('Error opening SQLite:', err.message);
//           reject(err);
//         } else {
//           console.log('Connected to SQLite dev database:', dbPath);
//           db = database;
//           // Pindahkan initializeDatabase ke sini
//           initializeDatabase(database)
//             .then(() => {
//               initialized = true;
//               resolve(db!);
//             })
//             .catch(reject);
//         }
//       });
//     });
//   } catch (error) {
//     console.error('Failed to load sqlite3 module:', error);
//     throw new Error('SQLite tidak tersedia. Pastikan `sqlite3` terinstall sebagai devDependency.');
//   }
// }

// // Inisialisasi tabel + data default
// async function initializeDatabase(database: Database): Promise<void> {
//   const initSQL = `
//     CREATE TABLE IF NOT EXISTS role (
//       role_id TEXT PRIMARY KEY,
//       role_name TEXT NOT NULL,
//       permissions TEXT,
//       deskripsi TEXT
//     );

//     CREATE TABLE IF NOT EXISTS pengguna (
//       pengguna_id TEXT PRIMARY KEY,
//       nama TEXT NOT NULL,
//       username TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       email TEXT,
//       telepon TEXT,
//       tanggal_bergabung DATETIME DEFAULT CURRENT_TIMESTAMP,
//       role_id TEXT REFERENCES role(role_id)
//     );

//     CREATE TABLE IF NOT EXISTS pelanggan (
//       pelanggan_id TEXT PRIMARY KEY,
//       nama_lengkap TEXT NOT NULL,
//       username TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       email TEXT,
//       telepon TEXT,
//       alamat TEXT,
//       tanggal_registrasi DATETIME DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS booking (
//       booking_id TEXT PRIMARY KEY,
//       pelanggan_id TEXT REFERENCES pelanggan(pelanggan_id),
//       tanggal_booking DATE NOT NULL,
//       jam_mulai TIME NOT NULL,
//       jam_selesai TIME NOT NULL,
//       status TEXT DEFAULT 'pending',
//       total_biaya REAL NOT NULL,
//       metode_pembayaran TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS membership (
//       membership_id TEXT PRIMARY KEY,
//       pelanggan_id TEXT REFERENCES pelanggan(pelanggan_id),
//       tanggal_daftar DATE NOT NULL,
//       status_keaktifan TEXT DEFAULT 'active',
//       tier_membership TEXT DEFAULT 'Silver',
//       expired_date DATE NOT NULL
//     );
//   `;

//   const defaultDataSQL = `
//     INSERT OR IGNORE INTO role (role_id, role_name, permissions, deskripsi) VALUES
//     ('R001', 'Owner', '["all"]', 'Pemilik usaha dengan akses penuh'),
//     ('R002', 'Pegawai', '["view_booking","view_membership","search_booking","search_membership"]', 'Staff operasional'),
//     ('R003', 'Pelanggan', '["add_booking","view_booking","add_membership","view_membership"]', 'Pelanggan biasa');

//     INSERT OR IGNORE INTO pengguna (pengguna_id, nama, username, password, email, telepon, role_id) VALUES
//     ('USR001', 'Pemilik Sanguku', 'owner', 'admin123', 'owner@sanguku.com', '081234567890', 'R001'),
//     ('USR002', 'Staff Pegawai', 'pegawai', 'pegawai123', 'pegawai@sanguku.com', '081234567891', 'R002'),
//     ('USR003', 'Pelanggan Demo', 'pelanggan', 'pelanggan123', 'pelanggan@sanguku.com', '081234567892', 'R003');

//     INSERT OR IGNORE INTO pelanggan (pelanggan_id, nama_lengkap, username, password, email, telepon, alamat) VALUES
//     ('PLG001', 'John Doe', 'johndoe', 'pelanggan123', 'john@email.com', '081234567892', 'Jl. Contoh No. 123, Yogyakarta'),
//     ('PLG002', 'Jane Smith', 'janesmith', 'pelanggan123', 'jane@email.com', '081234567893', 'Jl. Test No. 456, Yogyakarta');

//     INSERT OR IGNORE INTO booking (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, status, total_biaya, metode_pembayaran) VALUES
//     ('BKG001', 'PLG001', '2024-01-15', '14:00:00', '16:00:00', 'confirmed', 100000, 'QRIS'),
//     ('BKG002', 'PLG002', '2025-11-04', '16:00:00', '17:00:00', 'confirmed', 100000, 'Cash'),
//     ('BKG003', 'PLG003', '2024-01-16', '19:00:00', '11:00:00', 'pending', 100000, 'QRIS'),
//     ('BKG004', 'PLG001', '2024-01-17', '13:00:00', '21:00:00', 'confirmed', 100000, 'Cash'),
//     ('BKG005', 'PLG004', '2024-01-18', '18:00:00', '15:00:00', 'confirmed', 100000, 'QRIS'),
//     ('BKG007', 'PLG003', '2024-01-12', '08:00:00', '20:00:00', 'pending', 100000, 'Cash'),
//     ('BKG008', 'PLG005', '2024-01-01', '08:00:00', '10:00:00', 'confirmed', 100000, 'QRIS'),
//     ('BKG009', 'PLG004', '2024-01-05', '14:00:00', '16:00:00', 'cancelled', 100000, 'Cash');
//     INSERT OR IGNORE INTO membership (membership_id, pelanggan_id, tanggal_daftar, status_keaktifan, tier_membership, expired_date) VALUES
//     ('MEM001', 'PLG001', '2024-01-01', 'active', 'Gold', '2024-12-31'),
//     ('MEM002', 'PLG002', '2024-01-01', 'active', 'Silver', '2024-06-30');
//   `;

//   return new Promise<void>((resolve, reject) => {
//     database.exec(initSQL + defaultDataSQL, (err: Error | null) => {
//       if (err) {
//         console.error('Error initializing SQLite database:', err.message);
//         reject(err);
//       } else {
//         console.log('SQLite database initialized with default data');
//         resolve();
//       }
//     });
//   });
// }

// // QUERY WRAPPER
// export const devDB = {
//   query: async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
//     if (process.env.NODE_ENV !== 'development') {
//       throw new Error('devDB hanya bisa digunakan di development');
//     }

//     const database = await ensureDatabase();
//     const trimmedSql = sql.trim().toUpperCase();

//     return new Promise((resolve, reject) => {
//       console.log('Using Development Database - SQLite');

//       if (trimmedSql.startsWith('SELECT')) {
//         database.all(sql, params, (err: Error | null, rows: any[]) => {
//           if (err) reject(err);
//           else resolve({ rows });
//         });
//       }
//       else if (['INSERT', 'UPDATE', 'DELETE'].some(op => trimmedSql.startsWith(op))) {
//         database.run(
//           sql,
//           params,
//           function (this: RunResult, err: Error | null) {
//             if (err) {
//               reject(err);
//             } else {
//               if (trimmedSql.startsWith('INSERT')) {
//                 resolve({ rows: [{ id: this.lastID }] });
//               } else {
//                 resolve({ rows: [{ changes: this.changes }] });
//               }
//             }
//           }
//         );
//       }
//       else {
//         database.exec(sql, (err: Error | null) => {
//           if (err) reject(err);
//           else resolve({ rows: [] });
//         });
//       }
//     });
//   }
// };