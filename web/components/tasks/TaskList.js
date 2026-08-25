'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { DndContext, PointerSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { toFa } from '@/lib/toFa';
import { useDayTasks } from '@/lib/useDayTasks';
import TaskItem from './TaskItem';
import TaskInput from './TaskInput';

// بند ۲ در PLAN.md: جمع‌شونده، پیش‌فرض باز اگر کار انجام‌نشده دارد. این حالت
// فقط یک‌بار — همان اولین باری که داده واقعاً بارگذاری شد — تعیین می‌شود؛
// وگرنه با هر تغییر کارها، وضعیت باز/بسته‌ای که کاربر دستی انتخاب کرده دوباره می‌پرد.
export default function TaskList({ dayKey, title = 'کارها' }) {
  const { tasks, addTask, toggleTask, toggleRollover, removeTask, reorderTasks } = useDayTasks(dayKey);
  const [open, setOpen] = useState(true);
  const autoSet = useRef(false);
  // distance:8 یعنی یک تپ ساده (چک‌باکس/دکمهٔ سه‌نقطه) با کشیدن اشتباه گرفته نشود.
  // هر سه حسگر با هم — بعضی مرورگرها/ابزارها فقط یکی از رویدادهای
  // pointer/mouse/touch را درست شبیه‌سازی می‌کنند.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  useEffect(() => {
    if (autoSet.current || tasks.length === 0) return;
    autoSet.current = true;
    setOpen(tasks.some((t) => !t.done));
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = tasks.map((t) => t.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    reorderTasks(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        sx={{ width: '100%', minHeight: 52, px: 2, py: 1, justifyContent: 'space-between' }}
      >
        <Typography noWrap sx={{ fontWeight: 700, minWidth: 0 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, pl: 1 }}>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onToggleRollover={toggleRollover}
                  onRemove={removeTask}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Divider sx={{ borderColor: 'glass.border' }} />
          <TaskInput onAdd={addTask} />
        </Box>
      </Collapse>
    </Paper>
  );
}
