'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { toFa } from '@/lib/toFa';
import { useDayTasks } from '@/lib/useDayTasks';
import TaskItem from './TaskItem';
import TaskInput from './TaskInput';

// بند ۲ در PLAN.md: جمع‌شونده، پیش‌فرض باز اگر کار انجام‌نشده دارد. این حالت
// فقط یک‌بار — همان اولین باری که داده واقعاً بارگذاری شد — تعیین می‌شود؛
// وگرنه با هر تغییر کارها، وضعیت باز/بسته‌ای که کاربر دستی انتخاب کرده دوباره می‌پرد.
export default function TaskList({ dayKey }) {
  const { tasks, addTask, toggleTask, toggleRollover, removeTask, moveTask } = useDayTasks(dayKey);
  const [open, setOpen] = useState(true);
  const autoSet = useRef(false);

  useEffect(() => {
    if (autoSet.current || tasks.length === 0) return;
    autoSet.current = true;
    setOpen(tasks.some((t) => !t.done));
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        sx={{ width: '100%', minHeight: 52, px: 2, py: 1, justifyContent: 'space-between' }}
      >
        <Typography sx={{ fontWeight: 700 }}>کارها</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {toFa(doneCount)}/{toFa(tasks.length)}
          </Typography>
          <ExpandMoreRoundedIcon
            fontSize="small"
            sx={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </Box>
      </ButtonBase>

      <Collapse in={open}>
        <Divider sx={{ borderColor: 'glass.border' }} />
        <Box sx={{ py: 0.5 }}>
          {tasks.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onToggleRollover={toggleRollover}
              onRemove={removeTask}
              onMoveUp={(id) => moveTask(id, -1)}
              onMoveDown={(id) => moveTask(id, 1)}
              canMoveUp={i > 0}
              canMoveDown={i < tasks.length - 1}
            />
          ))}
          <Divider sx={{ borderColor: 'glass.border' }} />
          <TaskInput onAdd={addTask} />
        </Box>
      </Collapse>
    </Paper>
  );
}
