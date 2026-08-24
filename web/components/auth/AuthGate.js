'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { STAGE, useSession } from '@/lib/SessionContext';
import LoginForm from './LoginForm';

// بند ۱۴.۱ (بازنگری فاز ۵): ورود دروازهٔ کل اپ است — نه فقط تنظیمات. تا نشست
// معتبر نشود، هیچ‌چیز دیگری (حتی نوار ناوبری) رندر نمی‌شود.
export default function AuthGate({ children }) {
  const { stage } = useSession();

  if (stage === STAGE.LOADING) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (stage !== STAGE.LOGGED_IN) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <LoginForm />
        </Box>
      </Box>
    );
  }

  return children;
}
