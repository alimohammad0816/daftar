import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { EditorFocusProvider } from '@/lib/EditorFocusContext';
import IslandNav from './IslandNav';

// درخواست کاربر: بدون sidebar، بدون نوار بالا — فقط محتوا (وسط‌چین، عرض
// محدود برای خوانایی روی دسکتاپ) و ناوبری شناور «island» پایین صفحه.
export default function AppShell({ children }) {
  return (
    <EditorFocusProvider>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Container
          component="main"
          maxWidth="lg"
          disableGutters
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 1.5, sm: 3 },
            pt: 'calc(env(safe-area-inset-top, 0px) + 20px)',
            pb: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
          }}
        >
          {children}
        </Container>
        <IslandNav />
      </Box>
    </EditorFocusProvider>
  );
}
