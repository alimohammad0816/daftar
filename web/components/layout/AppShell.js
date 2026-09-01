import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { EditorFocusProvider } from '@/lib/EditorFocusContext';
import IslandNav from './IslandNav';

// درخواست کاربر: بدون sidebar، بدون نوار بالا — فقط محتوا (وسط‌چین) و ناوبری
// شناور «island» پایین صفحه. سقف عرض اینجا نیست، در خودِ هر صفحه است.
export default function AppShell({ children }) {
  return (
    <EditorFocusProvider>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* بدون سقف عرض: هر صفحه خودش عرض خوانای خودش را می‌گذارد و با
            mx: 'auto' وسط‌چین می‌شود (تقویم و یادداشت‌ها ۶۴۰، صفحهٔ روز روی
            دسکتاپ به‌مراتب پهن‌تر چون دو ستون است). سقف lg اینجا آن‌ها را از
            بیرون خفه می‌کرد. */}
        <Container
          component="main"
          maxWidth={false}
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
