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
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { formatDayNumber, formatMonthYear, fromDayKey } from '@/lib/jalali';
import { useNotesIndex } from '@/lib/useNotesIndex';

// فاز ۷ (نسخهٔ اولیه، بدون تگ): فهرست یادداشت‌ها — روزانه + آزاد، هر دو با
// هم، دقیقاً مثل «کارها» — + جست‌وجوی سمت کلاینت روی عنوان/متن. هر دو از سند
// index می‌آیند، بدون باز کردن سند هر یادداشت.
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
    <Box sx={{ pt: { xs: 1.5, sm: 2.5 }, width: '100%', maxWidth: 640, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, pr: 2, minHeight: 52 }}>
        <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جست‌وجو در یادداشت‌ها…"
          fullWidth
          sx={{ fontSize: '0.9rem' }}
        />
        <IconButton onClick={handleCreate} aria-label="یادداشت تازه" sx={{ width: 44, height: 44 }}>
          <AddRoundedIcon />
        </IconButton>
      </Paper>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          <StickyNote2RoundedIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
          <Typography>{notes.length === 0 ? 'هنوز یادداشتی نداری' : 'چیزی پیدا نشد'}</Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          {filtered.map((note, i) => {
            const isDaily = note.kind === 'daily';
            const date = note.dayKey ? fromDayKey(note.dayKey) : new Date(note.updatedAt);
            const dateLabel = `${formatDayNumber(date)} ${formatMonthYear(date)}`;
            return (
              <Box key={note.id}>
                {i > 0 && <Divider sx={{ borderColor: 'glass.border' }} />}
                <ButtonBase
                  onClick={() => router.push(isDaily ? `/day/${note.dayKey}` : `/notes/${note.id}`)}
                  sx={{ width: '100%', display: 'block', textAlign: 'start', px: 2, py: 1.5, minHeight: 44 }}
                >
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {isDaily ? dateLabel : note.title || 'بی‌عنوان'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    {!isDaily && note.dayKey && <EventRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                    {!isDaily && (
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {dateLabel}
                      </Typography>
                    )}
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
