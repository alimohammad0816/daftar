'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { getYDoc } from '@/lib/ydoc';
import { useLiveSync } from '@/lib/useLiveSync';
import { useNotesIndex } from '@/lib/useNotesIndex';
import { fromDayKey, toDayKey, formatDayNumber, formatMonthYear } from '@/lib/jalali';
import Editor from '@/components/editor/Editor';
import DayPickerSheet from '@/components/notes/DayPickerSheet';

const PLAIN_SNIPPET_LENGTH = 200;

// از فهرست یادداشت‌ها باز می‌شود — سند مستقل خودِ یادداشت (`note:{id}`) از
// سند index جداست (بند ۱۳.۳)؛ عنوان در index نگه داشته می‌شود، محتوا در سند
// خودش. هر دو باید جدا زنده نگه داشته شوند.
export default function FreeNotePage() {
  const { noteId } = useParams();
  const router = useRouter();
  const docId = `note:${noteId}`;
  useLiveSync(docId, getYDoc);

  const { notes, updateNoteMeta, deleteNote } = useNotesIndex();
  const entry = notes.find((n) => n.id === noteId);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);

  const handleTextChange = useCallback(
    (text) => {
      updateNoteMeta(noteId, { plain: text.trim().slice(0, PLAIN_SNIPPET_LENGTH) });
    },
    [noteId, updateNoteMeta],
  );

  const handleDelete = () => {
    deleteNote(noteId);
    router.push('/notes');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => router.push('/notes')} aria-label="بازگشت به یادداشت‌ها" sx={{ width: 44, height: 44 }}>
          <ArrowForwardRoundedIcon />
        </IconButton>
        <InputBase
          value={entry?.title ?? ''}
          onChange={(e) => updateNoteMeta(noteId, { title: e.target.value })}
          placeholder="بی‌عنوان"
          fullWidth
          sx={{ fontSize: '1.1rem', fontWeight: 700 }}
        />
        <IconButton onClick={handleDelete} aria-label="حذف یادداشت" sx={{ width: 44, height: 44 }}>
          <DeleteOutlineRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 0.5 }}>
        {entry?.dayKey ? (
          <Chip
            icon={<EventRoundedIcon />}
            label={`${formatDayNumber(fromDayKey(entry.dayKey))} ${formatMonthYear(fromDayKey(entry.dayKey))}`}
            onClick={() => setDayPickerOpen(true)}
            onDelete={() => updateNoteMeta(noteId, { dayKey: null })}
            sx={{ height: 36 }}
          />
        ) : (
          <Button
            size="small"
            startIcon={<EventRoundedIcon />}
            onClick={() => setDayPickerOpen(true)}
            sx={{ color: 'text.secondary' }}
          >
            اختصاص به یک روز
          </Button>
        )}
      </Box>

      <DayPickerSheet
        open={dayPickerOpen}
        onOpen={() => setDayPickerOpen(true)}
        onClose={() => setDayPickerOpen(false)}
        selectedDate={entry?.dayKey ? fromDayKey(entry.dayKey) : null}
        onSelectDay={(date) => updateNoteMeta(noteId, { dayKey: toDayKey(date) })}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Editor
          key={docId}
          docId={docId}
          getDoc={getYDoc}
          placeholder="یادداشت را بنویس…"
          onTextChange={handleTextChange}
        />
      </Box>
    </Box>
  );
}
