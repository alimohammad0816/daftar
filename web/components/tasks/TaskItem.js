'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// دستهٔ کشیدن جدا از بقیهٔ ردیف است تا کشیدن با تپ روی چک‌باکس/دکمهٔ
// گزینه‌ها قاطی نشود. راست‌کلیک همان منوی دکمهٔ سه‌نقطه را باز می‌کند.
export default function TaskItem({ task, onToggle, onRename, onToggleRollover, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  // دکمهٔ سه‌نقطه با anchorEl باز می‌شود (زیرِ خودِ دکمه)؛ راست‌کلیک با
  // anchorPosition دقیقاً زیر نوک نشانگر — چون anchorEl آن حالت کل ردیفِ
  // عریض را anchor می‌کرد و همیشه گوشهٔ همان ردیف باز می‌شد، نه زیر کلیک.
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const menuOpen = !!anchorEl || !!anchorPosition;
  // draft === null یعنی حالت عادی؛ رشته یعنی در حال ویرایش.
  const [draft, setDraft] = useState(null);
  const editing = draft !== null;

  const openMenuAtElement = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const openMenuAtCursor = (e) => {
    if (editing) return; // منوی متنیِ خودِ ورودی (چسباندن و…) را نگیر
    e.preventDefault();
    setAnchorPosition({ top: e.clientY, left: e.clientX });
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setAnchorPosition(null);
  };

  const startEdit = () => setDraft(task.title);
  const cancelEdit = () => setDraft(null);
  const commitEdit = () => {
    if (draft !== null) onRename(task.id, draft);
    setDraft(null);
  };

  // همان دام TaskInput: عوض‌کردن زبان صفحه‌کلید فوکوس پنجره را می‌گیرد و blur
  // می‌فرستد. اگر پنجره فوکوس ندارد، ویرایش نباید بسته شود.
  const handleEditBlur = () => {
    if (!document.hasFocus()) return;
    commitEdit();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <Box
      ref={setNodeRef}
      onContextMenu={openMenuAtCursor}
      sx={{
        display: 'flex',
        alignItems: 'center',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        bgcolor: isDragging ? 'action.hover' : 'transparent',
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        aria-label="جابه‌جایی با کشیدن"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          flexShrink: 0,
          color: 'text.secondary',
          touchAction: 'none',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <DragIndicatorRoundedIcon fontSize="small" />
      </Box>

      <Checkbox checked={task.done} onChange={() => onToggle(task.id)} sx={{ width: 44, height: 44 }} />

      {editing ? (
        <InputBase
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          autoFocus
          multiline
          fullWidth
          sx={{ flexGrow: 1, minWidth: 0, fontSize: '0.9rem', py: 0 }}
        />
      ) : (
        <Typography
          // روی دسکتاپ دابل‌کلیک، روی گوشی گزینهٔ «ویرایش» در همان منوی سه‌نقطه.
          onDoubleClick={startEdit}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            fontSize: '0.9rem',
            overflowWrap: 'break-word',
            textDecoration: task.done ? 'line-through' : 'none',
            color: task.done ? 'text.secondary' : 'text.primary',
          }}
        >
          {task.title}
        </Typography>
      )}

      {task.rollover && !editing && (
        <PushPinRoundedIcon aria-label="پین‌شده" sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
      )}

      <IconButton onClick={openMenuAtElement} aria-label="گزینه‌های بیشتر" sx={{ width: 44, height: 44 }}>
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>

      <Menu
        open={menuOpen}
        onClose={closeMenu}
        {...(anchorPosition
          ? { anchorReference: 'anchorPosition', anchorPosition }
          : { anchorEl })}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            startEdit();
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ویرایش</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onToggleRollover(task.id);
            closeMenu();
          }}
        >
          <ListItemIcon>
            {task.rollover ? (
              <PushPinRoundedIcon fontSize="small" color="primary" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{task.rollover ? 'لغو پین' : 'پین'}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onRemove(task.id);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>حذف</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
