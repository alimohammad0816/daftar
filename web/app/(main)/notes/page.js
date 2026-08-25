'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import { formatDayNumber, formatMonthYear } from '@/lib/jalali';
import { useNotesIndex } from '@/lib/useNotesIndex';

// فاز ۷ (نسخهٔ اولیه، بدون تگ): فهرست یادداشت‌های آزاد + جست‌وجوی سمت کلاینت
// روی عنوان/متن — هر دو از سند index می‌آیند، بدون باز کردن سند هر یادداشت.
export default function NotesPage() {
  const router = useRouter();
  const { notes, createNote } = useNotesIndex();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return notes;
    return notes.filter((n) => `${n.title} ${n.plain}`.includes(q));
  }, [notes, query]);

  const handleCreate = () => {
    const id = createNote();
    router.push(`/notes/${id}`);
  };

  return (
    <Box sx={{ pt: { xs: 1.5, sm: 2.5 }, maxWidth: 640, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          یادداشت‌ها
        </Typography>
        <IconButton onClick={handleCreate} aria-label="یادداشت تازه" sx={{ width: 44, height: 44 }}>
          <AddRoundedIcon />
        </IconButton>
      </Box>

      <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, minHeight: 52 }}>
        <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جست‌وجو در یادداشت‌ها…"
          fullWidth
          sx={{ fontSize: '0.9rem' }}
        />
      </Paper>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          <StickyNote2RoundedIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
          <Typography>{notes.length === 0 ? 'هنوز یادداشت آزادی نداری' : 'چیزی پیدا نشد'}</Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          {filtered.map((note, i) => {
            const date = new Date(note.updatedAt);
            return (
              <Box key={note.id}>
                {i > 0 && <Divider sx={{ borderColor: 'glass.border' }} />}
                <ButtonBase
                  onClick={() => router.push(`/notes/${note.id}`)}
                  sx={{ width: '100%', display: 'block', textAlign: 'start', px: 2, py: 1.5, minHeight: 44 }}
                >
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {note.title || 'بی‌عنوان'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatDayNumber(date)} {formatMonthYear(date)}
                    </Typography>
                    {note.plain && (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                        {note.plain}
                      </Typography>
                    )}
                  </Box>
                </ButtonBase>
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
}
