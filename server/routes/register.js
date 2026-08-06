import { Router } from 'express';
import { getPool, sql } from '../db.js';
import { config } from '../config.js';
import { hashPassword, getPasswordSqlExpression } from '../utils/hashPassword.js';

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9]{4,10}$/;
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validateRegistrationInput(body) {
  const username = sanitizeString(body.username, 10);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  const email = sanitizeString(body.email, 50);

  if (!USERNAME_RE.test(username)) {
    return { ok: false, code: 'USERNAME_INVALID', message: 'Username must be 4–10 alphanumeric characters.' };
  }

  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return { ok: false, code: 'PASSWORD_INVALID', message: 'Password must be 4–20 characters.' };
  }

  if (password !== confirmPassword) {
    return { ok: false, code: 'PASSWORD_MISMATCH', message: 'Passwords do not match.' };
  }

  if (!email) {
    return { ok: false, code: 'EMAIL_REQUIRED', message: 'Email address is required.' };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, code: 'EMAIL_INVALID', message: 'Invalid email address.' };
  }

  return {
    ok: true,
    data: { username, password, email },
  };
}

router.post('/', async (req, res) => {
  try {
    const validation = validateRegistrationInput(req.body);
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        code: validation.code,
        message: validation.message,
      });
    }

    const { username, password, email } = validation.data;
    const pool = await getPool();

    const duplicateCheck = await pool
      .request()
      .input('username', sql.VarChar(10), username)
      .query('SELECT TOP 1 memb___id FROM MEMB_INFO WHERE memb___id = @username');

    if (duplicateCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        code: 'USERNAME_TAKEN',
        message: 'Username is already taken.',
      });
    }

    const emailCheck = await pool
      .request()
      .input('email', sql.VarChar(50), email)
      .query('SELECT TOP 1 memb___id FROM MEMB_INFO WHERE mail_addr = @email');

    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_TAKEN',
        message: 'Email address is already registered.',
      });
    }

    const passwordHash = hashPassword(password, username);
    const passwordExpr = getPasswordSqlExpression();
    const snoNumb = config.registration.defaultSnoNumb;

    const insertRequest = pool
      .request()
      .input('username', sql.VarChar(10), username)
      .input('password', sql.VarChar(20), password)
      .input('passwordHash', sql.VarChar(32), passwordHash)
      .input('membName', sql.VarChar(10), username)
      .input('snoNumb', sql.VarChar(13), snoNumb)
      .input('email', sql.VarChar(50), email);

    /** WebEngine-compatible minimal MEMB_INFO insert (7 columns). */
    const insertMembInfo = `
      INSERT INTO MEMB_INFO (
        memb___id,
        memb__pwd,
        memb_name,
        sno__numb,
        mail_addr,
        bloc_code,
        ctl1_code
      ) VALUES (
        @username,
        ${passwordExpr},
        @membName,
        @snoNumb,
        @email,
        0,
        0
      )
    `;

    await insertRequest.query(insertMembInfo);

    if (config.registration.insertViCurrInfo) {
      await pool
        .request()
        .input('username', sql.VarChar(10), username)
        .input('membName', sql.VarChar(10), username)
        .input('snoNumb', sql.VarChar(13), snoNumb)
        .query(`
          INSERT INTO VI_CURR_INFO (
            ends_days,
            chek_code,
            used_time,
            memb___id,
            memb_name,
            memb_guid,
            sno__numb,
            Bill_Section,
            Bill_value,
            Bill_Hour,
            Surplus_Point,
            Surplus_Minute,
            Increase_Days
          )
          SELECT
            '2005',
            '1',
            0,
            @username,
            @membName,
            memb_guid,
            @snoNumb,
            '6',
            '3',
            '6',
            '6',
            '0',
            GETDATE()
          FROM MEMB_INFO
          WHERE memb___id = @username
        `);
    }

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. You can now log in with the game client.',
    });
  } catch (err) {
    console.error('[register] Error:', err.message);

    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Registration failed. Please try again later.',
    });
  }
});

export default router;
