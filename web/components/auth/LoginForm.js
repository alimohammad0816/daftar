'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { STAGE, useSession } from '@/lib/SessionContext';

// فرم تمام‌صفحهٔ ورود — AuthGate تا نشست معتبر نشود چیز دیگری رندر نمی‌کند.
export default function LoginForm() {
  const { stage, login, verifyTotp, verifyRecovery } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (stage === STAGE.NEED_CODE) {
    return (
      <Box component="form" onSubmit={submitCode} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
          ورود به دفتر
        </Typography>
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
      <Typography variant="h6" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
        ورود به دفتر
      </Typography>
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
