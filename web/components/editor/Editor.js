'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import { TableKit } from '@tiptap/extension-table';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Box from '@mui/material/Box';
import { getDayDoc } from '@/lib/ydoc';
import { Direction } from './extensions/Direction';
import { AttachmentImage } from './extensions/AttachmentImage';
import { FileAttachment } from './extensions/FileAttachment';
import { lowlight } from './extensions/codeLanguages';
import Toolbar from './Toolbar';
import MobileToolbar from './MobileToolbar';
import TableControls from './TableControls';

// «autosave» بند ۹ دیگر یک تایمر جداگانه نیست: Collaboration هر تراکنش را
// مستقیم در ydoc.getXmlFragment('note') می‌نویسد و IndexeddbPersistence
// (lib/ydoc.js) خودش با debounce داخلی‌اش روی دیسک نگه می‌دارد — دقیقاً
// همان سندی که کارهای همین روز هم در آن‌اند (بند ۱۳.۳).
export default function Editor({ dayKey }) {
  const { ydoc } = getDayDoc(dayKey);
  const [focused, setFocused] = useState(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false, codeBlock: false }),
        Highlight,
        Direction,
        Placeholder.configure({ placeholder: 'یادداشت این روز را بنویس…' }),
        Collaboration.configure({ document: ydoc, field: 'note' }),
        CodeBlockLowlight.configure({ lowlight }),
        TableKit.configure({ table: { resizable: false } }),
        AttachmentImage,
        FileAttachment,
      ],
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
    [dayKey],
  );

  if (!editor) return null;

  return (
    <Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar editor={editor} />
      </Box>

      <Box
        sx={{
          pb: { xs: focused ? 8 : 0, sm: 0 },
          '& .ProseMirror': {
            minHeight: 160,
            outline: 'none',
            fontSize: '0.95rem',
            lineHeight: 1.9,
          },
          '& .ProseMirror p': { margin: '0 0 0.6em' },
          '& .ProseMirror h2': { fontSize: '1.15rem', fontWeight: 700, margin: '0.6em 0 0.4em' },
          '& .ProseMirror blockquote': {
            margin: '0.6em 0',
            paddingInlineStart: 1.5,
            borderInlineStart: '3px solid',
            borderColor: 'divider',
            color: 'text.secondary',
          },
          '& .ProseMirror ul, & .ProseMirror ol': { paddingInlineStart: 3 },
          // دام CLAUDE.md: بلوک کد باید dir="ltr" اجباری داشته باشد وگرنه کد
          // فارسی‌چین و ناخواناست — صرف‌نظر از جهت پاراگراف اطرافش. stylis-plugin-rtl
          // حتی direction را هم آینه می‌کند (نه فقط left/right فیزیکی)، پس اینجا هم
          // باید برعکس بنویسیم تا خروجی نهایی واقعاً ltr شود — دقیقاً مثل ترفند float بالا.
          '& .ProseMirror pre': {
            direction: 'rtl',
            textAlign: 'right',
            unicodeBidi: 'isolate',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: '0.85rem',
            bgcolor: 'action.hover',
            color: 'text.primary',
            p: 1.5,
            my: 1,
            borderRadius: 2,
            overflowX: 'auto',
          },
          '& .ProseMirror pre code': { fontFamily: 'inherit', whiteSpace: 'pre' },
          // بند ۴ (تصمیم کاربر): جدول برخلاف بلوک کد dir="rtl" می‌گیرد تا ستون
          // اول راست باشد؛ خودِ افزونهٔ Table یک div.tableWrapper اطرافش
          // می‌گذارد — overflowX همان‌جا برای گوشی («روی موبایل دردسر است»).
          '& .ProseMirror .tableWrapper': { overflowX: 'auto', my: 1 },
          // اینجا هم برعکس می‌نویسیم (بند بالا دربارهٔ pre) تا بعد از آینه‌شدن
          // stylis-plugin-rtl، خروجی واقعاً rtl شود — ستون اول راست بماند.
          '& .ProseMirror table': {
            direction: 'ltr',
            borderCollapse: 'collapse',
            width: '100%',
          },
          '& .ProseMirror th, & .ProseMirror td': {
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            minWidth: 96,
            verticalAlign: 'top',
          },
          '& .ProseMirror th': { bgcolor: 'action.hover', fontWeight: 700 },
          // زرد پیش‌فرض مرورگر برای mark (از normalize.css) نگه داشته می‌شود —
          // قرمز طرح فقط برای تعطیلات خرج می‌شود، جای دیگری نه.
          '& .ProseMirror .is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            // stylis-plugin-rtl فیزیکی‌های چپ/راست را برای خروجی RTL آینه می‌کند؛
            // یعنی اینجا باید طوری بنویسیم انگار برای LTR است تا نتیجهٔ نهایی راست شود.
            float: 'left',
            height: 0,
            pointerEvents: 'none',
            color: 'text.disabled',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {focused && <MobileToolbar editor={editor} />}
      <TableControls editor={editor} />
    </Box>
  );
}
