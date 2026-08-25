'use client';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

export default function TaskItem({
  task,
  onToggle,
  onToggleRollover,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Checkbox
        checked={task.done}
        onChange={() => onToggle(task.id)}
        sx={{ width: 44, height: 44 }}
      />
      <Typography
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
      <IconButton
        onClick={() => onToggleRollover(task.id)}
        aria-label={task.rollover ? 'دیگر به روزهای بعد نبر' : 'اگر انجام نشد به روزهای بعد هم ببر'}
        aria-pressed={task.rollover}
        sx={{ width: 44, height: 44, color: task.rollover ? 'primary.main' : 'text.secondary' }}
      >
        {task.rollover ? <PushPinRoundedIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
      </IconButton>
      <IconButton
        disabled={!canMoveUp}
        onClick={() => onMoveUp(task.id)}
        aria-label="جابه‌جایی به بالا"
        sx={{ width: 44, height: 44 }}
      >
        <KeyboardArrowUpRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton
        disabled={!canMoveDown}
        onClick={() => onMoveDown(task.id)}
        aria-label="جابه‌جایی به پایین"
        sx={{ width: 44, height: 44 }}
      >
        <KeyboardArrowDownRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton onClick={() => onRemove(task.id)} aria-label="حذف کار" sx={{ width: 44, height: 44 }}>
        <DeleteOutlineRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
