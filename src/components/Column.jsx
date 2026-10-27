import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import './Column.css';

export function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(column.id, newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskText('');
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <h2 className="column-title">{column.title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="column-task-list" ref={setNodeRef}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <Card
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {isAdding ? (
        <form onSubmit={handleAddSubmit} className="add-task-form">
          <input
            autoFocus
            type="text"
            placeholder="What needs to be done?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="add-task-input"
          />
          <div className="add-task-actions">
            <button type="submit" className="btn-primary">Add Card</button>
            <button type="button" onClick={() => { setIsAdding(false); setNewTaskText(''); }} className="btn-cancel">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} className="add-task-btn">
          <Plus size={20} />
          <span>Add a card</span>
        </button>
      )}
    </div>
  );
}
