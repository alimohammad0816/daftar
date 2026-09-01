'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useSession } from '@/lib/SessionContext';
import { describeDevice } from '@/lib/describeDevice';
import { formatDayNumber, formatMonthYear } from '@/lib/jalali';
import { RADIUS_SM } from '@/theme/theme';

// تاریخ‌های نشست از سرور ISO می‌آیند؛ نمایش‌شان مثل هر تاریخ دیگر اپ شمسی و
// با اعداد فارسی است. تاریخ نامعتبر ردیف را خراب نکند — فقط پنهان می‌شود.
function faDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : `${formatDayNumber(d)} ${formatMonthYear(d)}`;
}

// نام مرورگر لاتین است و وسط متن فارسی می‌نشیند — قاعدهٔ «جزیره‌های LTR» در
// CLAUDE.md: با unicode-bidi جدا شود تا ترتیبش به‌هم نریزد.
function Latin({ children }) {
  return <Box component="span" sx={{ unicodeBidi: 'isolate' }}>{children}</Box>;
}

function DeviceRow({ label, since }) {
  const { browser, os, kind, raw, unknown } = describeDevice(label);
  const Icon = kind === 'mobile' ? SmartphoneRoundedIcon : ComputerRoundedIcon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: `${RADIUS_SM}px`,
        border: '1px solid',
        borderColor: 'glass.border',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: '50%',
          color: 'primary.main',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
        }}
      >
        <Icon fontSize="small" />
      </Box>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        {/* رشتهٔ خام UA در tooltip می‌ماند: اطلاعاتش از دست نمی‌رود ولی
            دیگر دو خط از پنل را اشغال نمی‌کند. */}
        <Tooltip title={raw || ''} placement="top-start">
          <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {unknown ? (
              <Latin>{raw}</Latin>
            ) : (
              <>
                {browser ? <Latin>{browser}</Latin> : 'مرورگر ناشناس'}
                {os ? ` روی ${os}` : ''}
              </>
            )}
          </Typography>
        </Tooltip>
        {since && (
          <Typography variant="caption" color="text.secondary">
            از {since}
          </Typography>
        )}
      </Box>

      <Chip label="این دستگاه" size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
    </Box>
  );
}

// AuthGate تضمین می‌کند این پنل فقط وقتی رندر می‌شود که نشست معتبر است — پس
// اینجا دیگر خودِ فرم ورود لازم نیست، فقط وضعیت و دکمهٔ خروج.
// سرور فعلاً فقط نشستِ همین دستگاه را برمی‌گرداند (/auth/me)، پس فهرست یک
// ردیفی است؛ ساختارش عمداً ردیف-محور است تا با آمدن endpoint نشست‌ها همین‌جا
// تکرار شود.
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        وارد شده به‌عنوان{' '}
        <Box component="strong" sx={{ color: 'text.primary', unicodeBidi: 'isolate' }}>
          {session?.username}
        </Box>
      </Typography>

      <DeviceRow label={session?.device_label} since={faDate(session?.created_at)} />

      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutRoundedIcon />}
        onClick={doLogout}
        disabled={busy}
        sx={{ alignSelf: 'flex-start', minHeight: 44 }}
      >
        خروج
      </Button>
    </Box>
  );
}
