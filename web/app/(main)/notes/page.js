import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function NotesPage() {
  return (
    <Box sx={{ pt: { xs: 1.5, sm: 2.5 }, px: 0.5 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
        یادداشت‌ها
      </Typography>
    </Box>
  );
}
