import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Card.css';

export function Card({ task, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(task.content);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="card editing"
        {...attributes}
        {...listeners}
      >
        <input
          autoFocus
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="edit-input"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when typing
        />
        <div className="edit-actions" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={handleSave} className="action-btn save"><Check size={16} /></button>
          <button onClick={() => { setIsEditing(false); setEditText(task.content); }} className="action-btn cancel"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card"
      {...attributes}
      {...listeners}
    >
      <div className="card-content">{task.content}</div>
      <div className="card-actions" onPointerDown={(e) => e.stopPropagation()}>
        <button onClick={() => setIsEditing(true)} className="action-btn edit" aria-label="Edit task">
          <Pencil size={16} />
        </button>
        <button onClick={() => onDelete(task.id)} className="action-btn delete" aria-label="Delete task">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
