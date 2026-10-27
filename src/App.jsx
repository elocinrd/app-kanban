import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import Board from './Board';
import './index.css';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Kanban Board</h1>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>
      <main className="board-container" style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Board />
      </main>
    </div>
  );
}

export default App;
