import Box from '@mui/material/Box';
import TopBar from './TopBar';
import NavRail from './NavRail';
import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <NavRail />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <TopBar />
        <Box component="main" sx={{ flexGrow: 1, pb: { xs: 7, sm: 0 } }}>
          {children}
        </Box>
        <BottomNav />
      </Box>
    </Box>
  );
}
