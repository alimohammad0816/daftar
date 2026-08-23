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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, minHeight: 44 }}>
      <AddRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        onBlur={submit}
        placeholder="کار تازه…"
        fullWidth
        sx={{ fontSize: '0.9rem' }}
      />
    </Box>
  );
}
