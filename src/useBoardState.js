import { useState, useEffect } from 'react';

const INITIAL_BOARD_STATE = {
  columns: [
    { id: 'todo', title: 'To Do', taskIds: [] },
    { id: 'in-progress', title: 'In Progress', taskIds: [] },
    { id: 'done', title: 'Done', taskIds: [] },
  ],
  tasks: {},
};

export const useBoardState = () => {
  const [boardData, setBoardData] = useState(() => {
    const savedData = localStorage.getItem('kanban-board');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse board data from localStorage');
      }
    }
    return INITIAL_BOARD_STATE;
  });

  useEffect(() => {
    localStorage.setItem('kanban-board', JSON.stringify(boardData));
  }, [boardData]);

  return [boardData, setBoardData];
};
