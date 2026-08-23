'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import Box from '@mui/material/Box';
import { getDayDoc } from '@/lib/ydoc';
import { Direction } from './extensions/Direction';
import Toolbar from './Toolbar';
import MobileToolbar from './MobileToolbar';

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
        StarterKit.configure({ undoRedo: false }),
        Highlight,
        Direction,
        Placeholder.configure({ placeholder: 'یادداشت این روز را بنویس…' }),
        Collaboration.configure({ document: ydoc, field: 'note' }),
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
    </Box>
  );
}
