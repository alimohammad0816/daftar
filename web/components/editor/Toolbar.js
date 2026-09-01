'use client';

import { useRef } from 'react';
import { useEditorState } from '@tiptap/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import FormatTextdirectionRToLRoundedIcon from '@mui/icons-material/FormatTextdirectionRToLRounded';
import FormatTextdirectionLToRRoundedIcon from '@mui/icons-material/FormatTextdirectionLToRRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded';
import { insertFileIntoEditor } from '@/lib/insertAttachment';

function ToolbarButton({ active, onClick, label, children }) {
  return (
    <IconButton
      // جلوگیری از blur شدن ادیتور موقع کلیک روی دکمه — وگرنه هم انتخاب متن
      // از دست می‌رود، هم (روی موبایل) MobileToolbar لحظه‌ای پنهان می‌شود.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
      }}
    >
      {children}
    </IconButton>
  );
}

// دقیقاً همان چهار قابلیت پایه‌ای که بند ۹ برای فاز ۳ خواسته: متن، عنوان،
// فهرست، نقل‌قول، هایلایت، Direction. بولد/ایتالیک همیشه در StarterKit
// هستند و میان‌بر صفحه‌کلید کار می‌کند حتی بدون دکمه، ولی چون پرکاربردترین
// قالب‌بندی‌اند دکمه هم دارند.
// editor.isActive(...) فقط لحظهٔ رندر را می‌خواند، نه تغییرات بعدی — کلیک‌کردن
// روی خودِ دکمه‌ها هم رندر جدید نمی‌سازد چون useEditor فقط EditorContent را
// آگاه می‌کند، نه خواهر‌وبرادرهایش را. useEditorState دقیقاً برای همین است.
function useToolbarState(editor) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      italic: e?.isActive('italic') ?? false,
      heading: e?.isActive('heading', { level: 2 }) ?? false,
      bulletList: e?.isActive('bulletList') ?? false,
      orderedList: e?.isActive('orderedList') ?? false,
      blockquote: e?.isActive('blockquote') ?? false,
      highlight: e?.isActive('highlight') ?? false,
      isLtr: e?.isActive({ dir: 'ltr' }) ?? false,
      codeBlock: e?.isActive('codeBlock') ?? false,
    }),
  });
}

export default function Toolbar({ editor }) {
  const state = useToolbarState(editor);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!editor || !state) return null;
  const { bold, italic, heading, bulletList, orderedList, blockquote, highlight, isLtr, codeBlock } = state;

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await insertFileIntoEditor(editor, file);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        overflowX: 'auto',
        px: 1,
        py: 0.5,
      }}
    >
      <ToolbarButton
        label="ضخیم"
        active={bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FormatBoldRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="ایتالیک"
        active={italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FormatItalicRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="عنوان"
        active={heading}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <TitleRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="فهرست نقطه‌ای"
        active={bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FormatListBulletedRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="فهرست شماره‌دار"
        active={orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FormatListNumberedRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="نقل‌قول"
        active={blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <FormatQuoteRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="هایلایت"
        active={highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <BorderColorRoundedIcon fontSize="small" />
      </ToolbarButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
      <ToolbarButton
        label={isLtr ? 'راست‌چین' : 'چپ‌چین'}
        active={isLtr}
        onClick={() => editor.chain().focus().setTextDirection(isLtr ? 'rtl' : 'ltr').run()}
      >
        {isLtr ? (
          <FormatTextdirectionRToLRoundedIcon fontSize="small" />
        ) : (
          <FormatTextdirectionLToRRoundedIcon fontSize="small" />
        )}
      </ToolbarButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
      <ToolbarButton label="بلوک کد" active={codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <CodeRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton
        label="جدول"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <GridOnRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton label="تصویر" onClick={() => imageInputRef.current?.click()}>
        <ImageRoundedIcon fontSize="small" />
      </ToolbarButton>
      <ToolbarButton label="ضمیمه" onClick={() => fileInputRef.current?.click()}>
        <AttachFileRoundedIcon fontSize="small" />
      </ToolbarButton>
      {/* بدون capture — با capture="environment" گوشی مستقیم دوربین را باز
          می‌کند و راهی به گالری نمی‌گذارد. accept="image/*" به‌تنهایی انتخابگر
          عادی را می‌آورد که خودِ دوربین هم یکی از گزینه‌هایش است. */}
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleFilePicked} />
      <input ref={fileInputRef} type="file" hidden onChange={handleFilePicked} />
    </Box>
  );
}
