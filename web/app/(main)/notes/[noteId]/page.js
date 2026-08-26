'use client';

import { useCallback, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import { getYDoc } from '@/lib/ydoc';
import { useLiveSync } from '@/lib/useLiveSync';
import { useNotesIndex } from '@/lib/useNotesIndex';
import { useManualSave } from '@/lib/useManualSave';
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

  const { notes, updateNoteMeta, deleteNote, connectNoteToDay, addTag, removeTag } = useNotesIndex();
  const entry = notes.find((n) => n.id === noteId);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const editorRef = useRef(null);
  const { handleSave, toastOpen, closeToast } = useManualSave(editorRef);

  const handleTagKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    addTag(noteId, tagInput);
    setTagInput('');
  };

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

  // یک روز حداکثر یک یادداشت وصل دارد؛ اگر آن روز از قبل یادداشت دیگری
  // داشت، این یادداشت با آن ادغام می‌شود (چیزی از دست نرود) و خودش حذف
  // می‌شود — پس باید به شناسهٔ یادداشتِ نهایی (که ممکن است همین نباشد) برویم.
  const handleSelectDay = (date) => {
    const survivingId = connectNoteToDay(noteId, toDayKey(date));
    if (survivingId !== noteId) router.push(`/notes/${survivingId}`);
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
        <IconButton onClick={handleSave} aria-label="ذخیره (Ctrl+S)" sx={{ width: 44, height: 44 }}>
          <SaveRoundedIcon fontSize="small" />
        </IconButton>
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

      <Box sx={{ px: 0.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
        <SellRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        {(entry?.tags ?? []).map((tag) => (
          <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(noteId, tag)} sx={{ height: 28 }} />
        ))}
        <InputBase
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="افزودن تگ…"
          sx={{ fontSize: '0.8rem', minWidth: 80, flexGrow: 1 }}
        />
      </Box>

      <DayPickerSheet
        open={dayPickerOpen}
        onOpen={() => setDayPickerOpen(true)}
        onClose={() => setDayPickerOpen(false)}
        selectedDate={entry?.dayKey ? fromDayKey(entry.dayKey) : null}
        onSelectDay={handleSelectDay}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Editor
          key={docId}
          ref={editorRef}
          docId={docId}
          getDoc={getYDoc}
          placeholder="یادداشت را بنویس…"
          onTextChange={handleTextChange}
        />
      </Box>

      <Snackbar
        open={toastOpen}
        onClose={closeToast}
        autoHideDuration={1500}
        message="ذخیره شد"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' } }}
      />
    </Box>
  );
}
