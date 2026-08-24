'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useSession } from '@/lib/SessionContext';

// AuthGate تضمین می‌کند این پنل فقط وقتی رندر می‌شود که نشست معتبر است — پس
// اینجا دیگر خودِ فرم ورود لازم نیست، فقط وضعیت و دکمهٔ خروج.
export default function LoginPanel() {
  const { session, logout } = useSession();
  const [busy, setBusy] = useState(false);

  const doLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  };

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
