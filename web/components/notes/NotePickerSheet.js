'use client';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import { RADIUS_SM } from '@/theme/theme';
import { useNotesIndex } from '@/lib/useNotesIndex';

// شیت پایین‌صفحه برای وصل‌کردن یک یادداشت *موجود* به روز جاری — طرف مقابل
// DayPickerSheet (که از یادداشت به روز می‌رود، اینجا از روز به یادداشت).
export default function NotePickerSheet({ open, onClose, onOpen, onPick }) {
  const { notes } = useNotesIndex();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      slotProps={{
        paper: { sx: { borderTopLeftRadius: RADIUS_SM, borderTopRightRadius: RADIUS_SM, border: 'none' } },
      }}
    >
      <Box sx={{ pt: 1.5, pb: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'glass.border', mx: 'auto', mb: 1 }} />
        {notes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>یادداشتی وجود ندارد</Typography>
        ) : (
          notes.map((note, i) => (
            <Box key={note.id}>
              {i > 0 && <Divider sx={{ borderColor: 'glass.border' }} />}
              <ButtonBase
                onClick={() => onPick(note.id)}
                sx={{ width: '100%', display: 'block', textAlign: 'start', px: 2, py: 1.5, minHeight: 44 }}
              >
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {note.title || 'بی‌عنوان'}
                </Typography>
                {note.plain && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {note.plain}
                  </Typography>
                )}
              </ButtonBase>
            </Box>
          ))
        )}
      </Box>
    </SwipeableDrawer>
  );
}
