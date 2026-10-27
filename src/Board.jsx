import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './components/Column';
import { Card } from './components/Card';
import { useBoardState } from './useBoardState';

function Board() {
  const [boardData, setBoardData] = useBoardState();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement to start drag, allowing clicks to pass through
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = (columnId, content) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, content };

    setBoardData((prev) => {
      const newTasks = { ...prev.tasks, [newTaskId]: newTask };
      const newColumns = prev.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, taskIds: [...col.taskIds, newTaskId] };
        }
        return col;
      });
      return { tasks: newTasks, columns: newColumns };
    });
  };

  const handleEditTask = (taskId, newContent) => {
    setBoardData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: { ...prev.tasks[taskId], content: newContent },
      },
    }));
  };

  const handleDeleteTask = (taskId) => {
    setBoardData((prev) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[taskId];

      const newColumns = prev.columns.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((id) => id !== taskId),
      }));

      return { tasks: newTasks, columns: newColumns };
    });
  };

  const onDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
    }
  };

  const findColumnOfTask = useCallback((taskId, columns) => {
    return columns.find(col => col.taskIds.includes(taskId));
  }, []);

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    setBoardData((prev) => {
      const activeColumn = findColumnOfTask(activeId, prev.columns);

      // Dropping task over another task
      if (isOverTask) {
        const overColumn = findColumnOfTask(overId, prev.columns);
        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          // Moving to a different column
          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col.id === activeColumn.id) {
                return { ...col, taskIds: col.taskIds.filter((id) => id !== activeId) };
              }
              if (col.id === overColumn.id) {
                const overIndex = col.taskIds.indexOf(overId);
                const isBelowOverItem =
                  over &&
                  active.rect.current.translated &&
                  active.rect.current.translated.top > over.rect.top + over.rect.height;
                const modifier = isBelowOverItem ? 1 : 0;

                const newTaskIds = [...col.taskIds];
                newTaskIds.splice(overIndex + modifier, 0, activeId);
                return { ...col, taskIds: newTaskIds };
              }
              return col;
            })
          };
        }
      }

      // Dropping task over an empty column
      if (isOverColumn) {
        const overColumnId = overId;
        if (activeColumn?.id !== overColumnId) {
          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col.id === activeColumn?.id) {
                return { ...col, taskIds: col.taskIds.filter((id) => id !== activeId) };
              }
              if (col.id === overColumnId) {
                return { ...col, taskIds: [...col.taskIds, activeId] };
              }
              return col;
            })
          };
        }
      }

      return prev;
    });
  };

  const onDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    if (isActiveTask && isOverTask) {
      setBoardData((prev) => {
        const activeColumn = findColumnOfTask(activeId, prev.columns);
        const overColumn = findColumnOfTask(overId, prev.columns);

        if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
          // Moving within the same column
          const activeIndex = activeColumn.taskIds.indexOf(activeId);
          const overIndex = overColumn.taskIds.indexOf(overId);

          if (activeIndex !== overIndex) {
            return {
              ...prev,
              columns: prev.columns.map((col) => {
                if (col.id === activeColumn.id) {
                  return { ...col, taskIds: arrayMove(col.taskIds, activeIndex, overIndex) };
                }
                return col;
              })
            };
          }
        }
        return prev;
      });
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="board" style={{ display: 'flex', gap: '24px', padding: '24px', overflowX: 'auto', alignItems: 'flex-start', height: '100%' }}>
        {boardData.columns.map((column) => {
          const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]).filter(Boolean);
          return (
            <Column
              key={column.id}
              column={column}
              tasks={tasks}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <Card task={activeTask} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default Board;
