'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from '@/lib/SessionContext';
import { listSessions, revokeSession } from '@/lib/api';
import { describeDevice } from '@/lib/describeDevice';
import { formatDayNumber, formatMonthYear } from '@/lib/jalali';
import { toFa } from '@/lib/toFa';
import { RADIUS_SM } from '@/theme/theme';

// تاریخ‌های نشست از سرور با آفست UTC می‌آیند (`+00:00`)، پس new Date آن‌ها را
// درست می‌خواند و همه‌چیز به وقت محلیِ همین دستگاه نشان داده می‌شود. این فقط
// خوش‌ظاهری نیست: با اختلاف نیم‌ساعتهٔ تهران، یک زمانِ نزدیک نیمه‌شب حتی روزِ
// تقویمیِ متفاوتی می‌شود، پس ساعت و تاریخ باید از یک منبع بیایند.
// تاریخ نامعتبر ردیف را خراب نکند — فقط پنهان می‌شود.
function faDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDayNumber(d)} ${formatMonthYear(d)}، ساعت ${toFa(`${hh}:${mm}`)}`;
}

// نام مرورگر لاتین است و وسط متن فارسی می‌نشیند — قاعدهٔ «جزیره‌های LTR» در
// CLAUDE.md: با unicode-bidi جدا شود تا ترتیبش به‌هم نریزد.
function Latin({ children }) {
  return <Box component="span" sx={{ unicodeBidi: 'isolate' }}>{children}</Box>;
}

// همان عنوانی که در ردیف دیده می‌شود، ولی به‌صورت رشته — برای متن دیالوگ.
function deviceTitle(label) {
  const { browser, os, raw, unknown } = describeDevice(label);
  if (unknown) return raw || 'ناشناس';
  return [browser || 'مرورگر ناشناس', os ? `روی ${os}` : null].filter(Boolean).join(' ');
}

function DeviceRow({ label, caption, current, onRevoke }) {
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
        // دستگاه جاری کمی برجسته‌تر است تا در فهرست فوراً پیدا شود.
        bgcolor: (theme) => alpha(theme.palette.primary.main, current ? 0.05 : 0),
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
          color: current ? 'primary.main' : 'text.secondary',
          bgcolor: (theme) =>
            current ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.07),
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
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Box>

      {current ? (
        <Chip label="این دستگاه" size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
      ) : (
        onRevoke && (
          <Tooltip title="خروج از این دستگاه">
            <IconButton
              onClick={onRevoke}
              aria-label="خروج از این دستگاه"
              sx={{ width: 44, height: 44, flexShrink: 0, color: 'text.secondary' }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      )}
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
  // null = هنوز نیامده. اگر درخواست شکست بخورد، به همان نشستِ جاریِ کانتکست
  // برمی‌گردیم؛ پنل نباید به‌خاطر یک خطای شبکه خالی بماند.
  const [devices, setDevices] = useState(null);
  // دستگاهی که منتظر تأیید کاربر برای بسته‌شدن است.
  const [pending, setPending] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState(null);

  const refresh = () => listSessions().then(setDevices).catch(() => setDevices([]));

  useEffect(() => {
    let cancelled = false;
    listSessions()
      .then((rows) => {
        if (!cancelled) setDevices(rows);
      })
      .catch(() => {
        if (!cancelled) setDevices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const doLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  };

  // بستن نشستِ یک دستگاه دیگر برگشت‌پذیر نیست (آن دستگاه باید دوباره وارد
  // شود) و ممکن است همان لحظه دستِ کسی باشد — پس تأیید می‌گیرد.
  const confirmRevoke = async () => {
    if (!pending?.id) return;
    setRevoking(true);
    setError(null);
    try {
      await revokeSession(pending.id);
      await refresh();
      setPending(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setRevoking(false);
    }
  };

  // دستگاه جاری همیشه اول؛ بقیه به ترتیب آخرین فعالیت (که سرور هم همان را
  // می‌دهد). اگر فهرست نیامد، دست‌کم همین دستگاه از کانتکست نشان داده می‌شود.
  const rows =
    devices && devices.length > 0
      ? [...devices].sort((a, b) => Number(b.current) - Number(a.current))
      : [{ device_label: session?.device_label, created_at: session?.created_at, current: true }];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        وارد شده به‌عنوان{' '}
        <Box component="strong" sx={{ color: 'text.primary', unicodeBidi: 'isolate' }}>
          {session?.username}
        </Box>
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            دستگاه‌های وارد شده
          </Typography>
          {devices === null ? (
            <CircularProgress size={12} />
          ) : (
            devices.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                ({toFa(devices.length)})
              </Typography>
            )
          )}
        </Box>

        {rows.map((d, i) => (
          <DeviceRow
            // نشست شناسهٔ عمومی دارد؛ برای ردیفِ جایگزینِ آفلاین (که شناسه
            // ندارد) به ترتیب برمی‌گردیم.
            key={d.id || `fallback-${i}`}
            label={d.device_label}
            current={d.current}
            onRevoke={d.id ? () => setPending(d) : undefined}
            caption={
              d.current
                ? faDateTime(d.created_at) && `از ${faDateTime(d.created_at)}`
                : faDateTime(d.last_seen_at) && `آخرین فعالیت ${faDateTime(d.last_seen_at)}`
            }
          />
        ))}
      </Box>

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

      <Dialog open={!!pending} onClose={() => !revoking && setPending(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>خروج از این دستگاه؟</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            نشست «{deviceTitle(pending?.device_label)}» بسته می‌شود و آن دستگاه برای ادامه باید دوباره وارد شود.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)} disabled={revoking} sx={{ minHeight: 44 }}>
            انصراف
          </Button>
          <Button onClick={confirmRevoke} color="error" disabled={revoking} sx={{ minHeight: 44 }}>
            خروج
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
