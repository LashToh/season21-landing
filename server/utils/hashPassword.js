import crypto from 'node:crypto';
import { config } from '../config.js';

/**
 * MU Online password hashing varies by server files and JoinServer settings.
 *
 * Supported HASH_METHOD values (set in .env):
 *
 * - plain  — Plain text in memb__pwd (varchar). Use when JoinServer has MD5 disabled
 *            and memb__pwd column is varchar(10–20).
 *
 * - md5    — PHP-style MD5 hex string (32 chars). Common on MuDevs / IGCN web panels
 *            when memb__pwd is varchar(32) and PasswordEncryptType = MD5 (type 2).
 *
 * - wz_md5 — Webzen WZ MD5 via SQL Server function dbo.fn_md5(password, username).
 *            Returns binary(16). Requires XP_MD5_EncodeKeyVal / WZ_MD5_MOD.dll on SQL Server
 *            and memb__pwd as varbinary(16). Hashing happens in SQL, not in Node.
 *
 * Verify your MuDevs Season 21 JoinServer config (e.g. YlNeedMD5) and MEMB_INFO.memb__pwd
 * column type, then pick the matching method.
 */
export function hashPassword(password, username) {
  switch (config.hashMethod) {
    case 'plain':
      return password;

    case 'md5':
      return crypto.createHash('md5').update(password, 'utf8').digest('hex');

    case 'wz_md5':
      // Handled in SQL via dbo.fn_md5(@password, @username)
      return password;

    default:
      throw new Error(`Unsupported HASH_METHOD: ${config.hashMethod}`);
  }
}

/**
 * SQL expression for memb__pwd column based on hash method.
 */
export function getPasswordSqlExpression() {
  if (config.hashMethod === 'wz_md5') {
    return 'dbo.fn_md5(@password, @username)';
  }
  return '@passwordHash';
}
