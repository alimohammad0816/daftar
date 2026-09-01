'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import { TableKit } from '@tiptap/extension-table';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Box from '@mui/material/Box';
import { getDayDoc } from '@/lib/ydoc';
import { useEditorFocus } from '@/lib/EditorFocusContext';
import { RADIUS_SM } from '@/theme/theme';
import { Direction } from './extensions/Direction';
import { AttachmentImage } from './extensions/AttachmentImage';
import { FileAttachment } from './extensions/FileAttachment';
import { lowlight } from './extensions/codeLanguages';
import Toolbar from './Toolbar';
import MobileToolbar from './MobileToolbar';
import TableControls from './TableControls';

const TEXT_CHANGE_DEBOUNCE_MS = 800;

// «autosave» بند ۹ دیگر یک تایمر جداگانه نیست: Collaboration هر تراکنش را
// مستقیم در ydoc.getXmlFragment('note') می‌نویسد و IndexeddbPersistence
// (lib/ydoc.js) خودش با debounce داخلی‌اش روی دیسک نگه می‌دارد — دقیقاً
// همان سندی که کارهای همین روز هم در آن‌اند (بند ۱۳.۳).
// getDoc پیش‌فرض getDayDoc است؛ فاز ۷ همین کامپوننت را با getYDoc برای
// یادداشت آزاد هم استفاده می‌کند (docId وقتی آزاد است `note:{id}`).
const Editor = forwardRef(function Editor(
  { docId, getDoc = getDayDoc, placeholder = 'یادداشت این روز را بنویس…', onTextChange },
  ref,
) {
  const { ydoc } = getDoc(docId);
  const [focused, setFocused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { setFocused: setGlobalFocused } = useEditorFocus();
  const textChangeTimer = useRef(null);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false, codeBlock: false }),
        Highlight,
        Direction,
        Placeholder.configure({ placeholder }),
        Collaboration.configure({ document: ydoc, field: 'note' }),
        CodeBlockLowlight.configure({ lowlight }),
        TableKit.configure({ table: { resizable: false } }),
        AttachmentImage,
        FileAttachment,
      ],
      onFocus: () => {
        setFocused(true);
        setGlobalFocused(true);
      },
      onBlur: () => {
        setFocused(false);
        setGlobalFocused(false);
      },
      // فقط وقتی استفاده می‌شود که والد onTextChange بدهد — نوشتن خلاصهٔ متن
      // ساده در سند index برای فهرست/جست‌وجو (هم صفحهٔ روز، هم یادداشت آزاد).
      onUpdate: onTextChange
        ? ({ editor: e }) => {
            clearTimeout(textChangeTimer.current);
            textChangeTimer.current = setTimeout(() => onTextChange(e.getText()), TEXT_CHANGE_DEBOUNCE_MS);
          }
        : undefined,
    },
    [docId, getDoc],
  );

  // خودِ محتوا همیشه فوری در Y.Doc نوشته می‌شود (بند ۱۳.۳) — «ذخیرهٔ دستی»
  // چیزی را که قبلاً ذخیره نشده باشد ذخیره نمی‌کند، فقط منتظر debounce بالا
  // نمی‌ماند: همان لحظه onTextChange را با متن فعلی صدا می‌زند.
  useImperativeHandle(
    ref,
    () => ({
      flushTextChange: () => {
        if (!onTextChange || !editor) return;
        clearTimeout(textChangeTimer.current);
        onTextChange(editor.getText());
      },
    }),
    [onTextChange, editor],
  );

  // تمام‌صفحه: Escape برای خروج، و قفل اسکرول سند پشت سر — وگرنه چرخ ماوس
  // روی ادیتورِ رسیده‌به‌ته، صفحهٔ زیرین را می‌لغزاند (و روی موبایل نوار
  // ناوبری مرورگر مدام باز و بسته می‌شود). مقدار قبلی overflow برگردانده
  // می‌شود، نه پاک — ممکن است جای دیگری آن را ست کرده باشد.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  // با تعویض سند، key=docId این کامپوننت را می‌سازد و از نو می‌سازد بدون آنکه
  // onBlur ادیتور قبلی فرصت اجرا پیدا کند — بدون این پاک‌سازی، IslandNav
  // می‌تواند برای همیشه پنهان بماند.
  useEffect(() => () => setGlobalFocused(false), [setGlobalFocused]);
  useEffect(() => () => clearTimeout(textChangeTimer.current), []);

  if (!editor) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        // تمام‌صفحه: کل قاب از جریان صفحه بیرون می‌رود و روی همه‌چیز می‌نشیند.
        // appBar + 1 یعنی بالای IslandNav (appBar) ولی زیر MobileToolbar
        // (appBar + 2) و زیر BottomSheet جدول — هر دو باید روی ادیتور بمانند.
        ...(fullscreen && {
          position: 'fixed',
          inset: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      {/* روی گوشی تولبار بالا پنهان است و تولبار پایین فقط با فوکوس می‌آید —
          پس در تمام‌صفحه بدون این دکمه هیچ راه خروجی نمی‌ماند (نه Escape هست
          نه تولبار). یک ردیف واقعی است نه دکمهٔ شناور، تا روی خط اول متن نیفتد. */}
      {fullscreen && (
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'glass.border',
            px: 0.5,
          }}
        >
          <IconButton
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setFullscreen(false)}
            aria-label="خروج از تمام‌صفحه"
            sx={{ width: 44, height: 44, color: 'text.secondary' }}
          >
            <FullscreenExitRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: { xs: 'none', sm: 'block' }, borderBottom: '1px solid', borderColor: 'glass.border' }}>
        <Toolbar editor={editor} fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} />
      </Box>

      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          pb: { xs: focused ? 8 : 1.5, sm: 1.5 },
          pt: 1,
          // در تمام‌صفحه، *این* ناحیه اسکرول می‌شود نه سند پشت سر. minHeight: 0
          // برای اینکه یک فرزند flex بتواند از والدش کوتاه‌تر شود و واقعاً
          // اسکرول بگیرد (وگرنه با محتوای بلند کش می‌آید و سرریز می‌کند).
          ...(fullscreen && { flexGrow: 1, minHeight: 0, overflowY: 'auto' }),
          '& .ProseMirror': {
            // تمام‌صفحه یعنی تمام عرض — عمداً هیچ سقف عرض/وسط‌چینی اینجا نیست
            // (درخواست صریح کاربر). حاشیه فقط همان px والد است.
            minHeight: fullscreen ? '100%' : 160,
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
            borderRadius: `${RADIUS_SM}px`,
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

      {focused && (
        <MobileToolbar
          editor={editor}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((v) => !v)}
        />
      )}
      <TableControls editor={editor} />
    </Paper>
  );
});

export default Editor;
