import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoginPanel from '@/components/settings/LoginPanel';

export default function SettingsPage() {
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
        تنظیمات
      </Typography>

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          همگام‌سازی
        </Typography>
        <LoginPanel />
      </Box>
    </Box>
  );
}
