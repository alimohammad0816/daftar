'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { addDays, formatDayNumber, formatMonthYear, formatWeekdayLong, fromDayKey, toDayKey } from '@/lib/jalali';
import { getHoliday } from '@/lib/holidays';
import { useSwipe } from '@/lib/useSwipe';
import { useLiveSync } from '@/lib/useLiveSync';
import { getYDoc } from '@/lib/ydoc';
import { useNotesIndex } from '@/lib/useNotesIndex';
import { useManualSave } from '@/lib/useManualSave';
import { hasLegacyDayNoteContent, migrateLegacyDayNote } from '@/lib/mergeNoteContent';
import TaskList from '@/components/tasks/TaskList';
import Editor from '@/components/editor/Editor';
import NotePickerSheet from '@/components/notes/NotePickerSheet';

const PLAIN_SNIPPET_LENGTH = 200;

// از تقویم باز می‌شود (app/(main)/page.js) — کارها + یادداشتِ همان یک روز.
// یادداشت یک نهاد یکتاست، نه دو نوع جدا: همین سند (note:{id}) هم از اینجا
// هم از /notes/{id} ویرایش می‌شود؛ حداکثر یک یادداشت به هر روز وصل است
// (بند ۳ + useNotesIndex.connectNoteToDay). سوایپ افقی بین روزها جابه‌جا
// می‌کند، فقط حالا با تغییر مسیر.
export default function DayPage() {
  const { dayKey } = useParams();
  const router = useRouter();
  const date = fromDayKey(dayKey);
  const holiday = getHoliday(dayKey);
  const dayStatus = useLiveSync(dayKey); // کارهای همین روز هنوز در سند خودِ روزند

  const { notes, createNote, updateNoteMeta, connectNoteToDay } = useNotesIndex();
  const note = notes.find((n) => n.dayKey === dayKey);
  const noteDocId = note ? `note:${note.id}` : null;
  useLiveSync(noteDocId, getYDoc);

  // پیش از این معماری، هر روز سند مستقل خودش را برای یادداشت داشت — این
  // فقط یک‌بار محتوای باقی‌مانده را به یک یادداشت واقعی منتقل می‌کند تا
  // چیزی از دست نرود. باید صبر کند تا سند همان روز واقعاً از سرور بیاید
  // (dayStatus === 'connected')، وگرنه سند محلیِ هنوز خالی را «بدون یادداشت»
  // تشخیص می‌دهد و هیچ‌وقت واقعاً بررسی نمی‌کند.
  useEffect(() => {
    if (note || dayStatus !== 'connected') return;
    if (!hasLegacyDayNoteContent(dayKey)) return;
    const id = createNote(dayKey);
    migrateLegacyDayNote(dayKey, `note:${id}`);
  }, [dayKey, note, createNote, dayStatus]);

  const handleTextChange = useCallback(
    (text) => {
      if (!note) return;
      updateNoteMeta(note.id, { plain: text.trim().slice(0, PLAIN_SNIPPET_LENGTH) });
    },
    [note, updateNoteMeta],
  );

  const editorRef = useRef(null);
  const { handleSave, toastOpen, closeToast } = useManualSave(editorRef);
  const [notePickerOpen, setNotePickerOpen] = useState(false);

  const goToDay = (d) => router.push(`/day/${toDayKey(d)}`);
  const daySwipe = useSwipe({
    onSwipeLeft: () => goToDay(addDays(date, 1)),
    onSwipeRight: () => goToDay(addDays(date, -1)),
  });

  const handleCreateNote = () => createNote(dayKey);
  const handlePickNote = (pickedId) => {
    connectNoteToDay(pickedId, dayKey);
    setNotePickerOpen(false);
  };

  return (
    <Box
      {...daySwipe}
      sx={{
        touchAction: 'pan-y',
        width: '100%',
        // روی دسکتاپ کارها و ادیتور کنار هم می‌نشینند (پایین‌تر)، پس قاب هم
        // باید پهن‌تر شود؛ روی موبایل همان ۷۲۰ی قبل، تک‌ستونی.
        maxWidth: { xs: 720, md: 1100 },
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => router.push('/')} aria-label="بازگشت به تقویم" sx={{ width: 44, height: 44 }}>
          <ArrowForwardRoundedIcon />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {formatWeekdayLong(date)}، {formatDayNumber(date)} {formatMonthYear(date)}
          </Typography>
          {holiday && (
            <Typography variant="body2" sx={{ color: 'holiday.main', fontWeight: 600 }}>
              {holiday}
            </Typography>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {note && (
          <>
            <IconButton onClick={handleSave} aria-label="ذخیره (Ctrl+S)" sx={{ width: 44, height: 44 }}>
              <SaveRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => router.push(`/notes/${note.id}`)}
              aria-label="باز کردن به‌عنوان یادداشت"
              sx={{ width: 44, height: 44 }}
            >
              <OpenInNewRoundedIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* موبایل مرجع است: کارها بالا، یادداشت زیرش. از md به بالا همان دو
          بلوک نصف‌نصف کنار هم می‌آیند — alignItems: flex-start تا کارتِ کوتاهِ
          کارها به قد ادیتور کش نیاید. minWidth: 0 هم لازم است وگرنه محتوای
          پهن (جدول، بلوک کد) ستون flex را از عرض ۵۰٪ بیرون می‌زند. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box sx={{ width: '100%', minWidth: 0, flex: { md: '1 1 0' } }}>
          <TaskList key={dayKey} dayKey={dayKey} />
        </Box>

        <Box sx={{ width: '100%', minWidth: 0, flex: { md: '1 1 0' } }}>
          {note ? (
            <Editor key={noteDocId} ref={editorRef} docId={noteDocId} getDoc={getYDoc} onTextChange={handleTextChange} />
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', px: 0.5 }}>
              <Button size="small" startIcon={<NoteAddRoundedIcon />} onClick={handleCreateNote} variant="outlined">
                یادداشت تازه
              </Button>
              <Button
                size="small"
                startIcon={<LinkRoundedIcon />}
                onClick={() => setNotePickerOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                وصل‌کردن یادداشت موجود
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <NotePickerSheet
        open={notePickerOpen}
        onOpen={() => setNotePickerOpen(true)}
        onClose={() => setNotePickerOpen(false)}
        onPick={handlePickNote}
      />

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
