'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { getYDoc } from '@/lib/ydoc';
import { useLiveSync } from '@/lib/useLiveSync';
import { useNotesIndex } from '@/lib/useNotesIndex';
import Editor from '@/components/editor/Editor';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720, mx: 'auto' }}>
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
