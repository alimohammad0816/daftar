'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

export default function TaskInput({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  // عوض‌کردن زبان صفحه‌کلید (Win+Space روی ویندوز، Ctrl+Space و مشابهش روی
  // لینوکس) فوکوس را از خودِ پنجرهٔ مرورگر می‌گیرد، و مرورگر همان لحظه روی
  // input رویداد blur می‌فرستد — یعنی متنِ نیمه‌کاره به‌عنوان یک کار ثبت
  // می‌شد و ورودی خالی می‌ماند. blurِ «واقعی» (کلیک روی جای دیگری از همین
  // صفحه) با blurِ ناشی از رفتن فوکوسِ پنجره با document.hasFocus() تفکیک
  // می‌شود: در حالت دوم متن دست‌نخورده سر جایش می‌ماند.
  const handleBlur = () => {
    if (!document.hasFocus()) return;
    submit();
  };

  const handleKeyDown = (e) => {
    // وسط ترکیب IME، Enter یعنی «این کاندیدا را قبول کن»، نه «ثبت کن».
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, minHeight: 44 }}>
      <AddRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="کار تازه…"
        fullWidth
        sx={{ fontSize: '0.9rem' }}
      />
    </Box>
  );
}
