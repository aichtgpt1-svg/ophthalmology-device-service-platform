import pool from '../config/db.js';
import { sendMaintenanceAlert } from '../config/mailer.js';

export async function notifyDueJobs() {
  const { rows } = await pool.query(`
    SELECT m.*, d.serial_number, d.model, u.email
    FROM maintenance_schedules m
    JOIN devices d ON d.id = m.device_id
    JOIN users u ON u.id = d.owner_id
    WHERE m.next_due <= NOW()
  `);
  if (!rows.length) return;

  // group by recipient
  const map = new Map<string, typeof rows>();
  for (const j of rows) {
    if (!map.has(j.email)) map.set(j.email, []);
    map.get(j.email)!.push(j);
  }
  for (const [email, jobs] of map) await sendMaintenanceAlert(email, jobs);
}