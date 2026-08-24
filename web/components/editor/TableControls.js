'use client';

import { useEditorState } from '@tiptap/react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AddRounded from '@mui/icons-material/AddRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import DeleteForeverRounded from '@mui/icons-material/DeleteForeverRounded';

// بند ۴: «کنترل‌های افزودن/حذف سطر و ستون را به‌جای منوی شناور، در یک
// BottomSheet بگذار که با انتخاب جدول باز شود» — روی موبایل منوی شناور را
// نمی‌شود درست لمس کرد.
export default function TableControls({ editor }) {
  const inTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.isActive('table') ?? false,
  });

  if (!editor) return null;

  const run = (fn) => () => fn().focus().run();

  return (
    <Drawer
      anchor="bottom"
      variant="persistent"
      open={!!inTable}
      ModalProps={{ keepMounted: true }}
      slotProps={{ paper: { sx: { border: 'none', borderTop: '1px solid', borderColor: 'divider' } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', px: 1.5, py: 1 }}>
        <Button size="small" startIcon={<AddRounded />} onClick={run(() => editor.chain().addRowBefore())} sx={{ minHeight: 44, flexShrink: 0 }}>
          سطر بالا
        </Button>
        <Button size="small" startIcon={<AddRounded />} onClick={run(() => editor.chain().addRowAfter())} sx={{ minHeight: 44, flexShrink: 0 }}>
          سطر پایین
        </Button>
        <Button size="small" color="error" startIcon={<DeleteRounded />} onClick={run(() => editor.chain().deleteRow())} sx={{ minHeight: 44, flexShrink: 0 }}>
          حذف سطر
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
        <Button size="small" startIcon={<AddRounded />} onClick={run(() => editor.chain().addColumnBefore())} sx={{ minHeight: 44, flexShrink: 0 }}>
          ستون قبل
        </Button>
        <Button size="small" startIcon={<AddRounded />} onClick={run(() => editor.chain().addColumnAfter())} sx={{ minHeight: 44, flexShrink: 0 }}>
          ستون بعد
        </Button>
        <Button size="small" color="error" startIcon={<DeleteRounded />} onClick={run(() => editor.chain().deleteColumn())} sx={{ minHeight: 44, flexShrink: 0 }}>
          حذف ستون
        </Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
        <Button size="small" color="error" startIcon={<DeleteForeverRounded />} onClick={run(() => editor.chain().deleteTable())} sx={{ minHeight: 44, flexShrink: 0 }}>
          حذف جدول
        </Button>
      </Box>
    </Drawer>
  );
}
