import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LoginPanel from '@/components/settings/LoginPanel';
import AppearancePanel from '@/components/settings/AppearancePanel';

export default function SettingsPage() {
  return (
    <Box sx={{ pt: { xs: 1.5, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, px: 0.5 }}>
        تنظیمات
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          ظاهر
        </Typography>
        <AppearancePanel />
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          همگام‌سازی
        </Typography>
        <LoginPanel />
      </Paper>
    </Box>
  );
}
