'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import { login, logout, me, verifyRecovery, verifyTotp } from '@/lib/api';

// بند ۱۴.۱: ورود دروازهٔ همگام‌سازی است، نه دروازهٔ اپ — این پنل فقط داخل
// تنظیمات است، هیچ صفحه‌ای را قفل نمی‌کند. اتصال زنده (WebSocket) فاز ۵ است؛
// اینجا فقط رمز→TOTP/کد بازیابی→نشست کار می‌کند.
const STAGE = { LOADING: 'loading', LOGGED_OUT: 'logged-out', NEED_CODE: 'need-code', LOGGED_IN: 'logged-in' };

export default function LoginPanel() {
  const [stage, setStage] = useState(STAGE.LOADING);
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await me();
      setSession(data);
      setStage(STAGE.LOGGED_IN);
    } catch {
      setStage(STAGE.LOGGED_OUT);
    }
  }, []);

  useEffect(() => {
    me()
      .then((data) => {
        setSession(data);
        setStage(STAGE.LOGGED_IN);
      })
      .catch(() => setStage(STAGE.LOGGED_OUT));
  }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      setStage(STAGE.NEED_CODE);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (useRecovery ? verifyRecovery(code) : verifyTotp(code));
      setPassword('');
      setCode('');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } finally {
      setSession(null);
      setUsername('');
      setStage(STAGE.LOGGED_OUT);
      setBusy(false);
    }
  };

  if (stage === STAGE.LOADING) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (stage === STAGE.LOGGED_IN) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography>
          وارد شده به‌عنوان <strong>{session?.username}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          این دستگاه: {session?.device_label || 'ناشناس'}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={doLogout}
          disabled={busy}
          sx={{ alignSelf: 'flex-start', minHeight: 44 }}
        >
          خروج
        </Button>
      </Box>
    );
  }

  if (stage === STAGE.NEED_CODE) {
    return (
      <Box component="form" onSubmit={submitCode} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label={useRecovery ? 'کد بازیابی' : 'کد شش‌رقمی'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          fullWidth
          slotProps={{ htmlInput: { className: 'ltr', dir: 'ltr' } }}
        />
        <Button type="submit" variant="contained" disabled={busy || !code} sx={{ minHeight: 44 }}>
          تأیید
        </Button>
        <Link
          component="button"
          type="button"
          onClick={() => {
            setUseRecovery((v) => !v);
            setCode('');
            setError('');
          }}
          sx={{ fontSize: '0.85rem' }}
        >
          {useRecovery ? 'به‌جای کد بازیابی، کد شش‌رقمی را وارد کن' : 'کد بازیابی داری؟'}
        </Link>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={submitPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="نام کاربری" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus fullWidth />
      <TextField
        label="رمز عبور"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={busy || !username || !password} sx={{ minHeight: 44 }}>
        ورود
      </Button>
    </Box>
  );
}
