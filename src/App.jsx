import React, { useState, useEffect } from 'react';

export default function App() {
  // State-ები
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Note #1', completed: false },
      { id: 2, text: 'Note #2', completed: true },
      { id: 3, text: 'Note #3', completed: false }
    ];
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETE, INCOMPLETE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // ADD ან EDIT
  const [currentTodo, setCurrentTodo] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Undo ფუნქციონალი
  const [lastDeletedTodo, setLastDeletedTodo] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(5);

  // ეფექტები LocalStorage-ისთვის
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Undo ტაიმერი
  useEffect(() => {
    let timer;
    if (showUndo && undoCountdown > 0) {
      timer = setTimeout(() => setUndoCountdown(undoCountdown - 1), 1000);
    } else if (undoCountdown === 0) {
      setShowUndo(false);
    }
    return () => clearTimeout(timer);
  }, [showUndo, undoCountdown]);

  // ჰენდლერები
  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const openAddModal = () => {
    setModalMode('ADD');
    setInputValue('');
    setIsModalOpen(true);
  };

  const openEditModal = (todo) => {
    setModalMode('EDIT');
    setCurrentTodo(todo);
    setInputValue(todo.text);
    setIsModalOpen(true);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (modalMode === 'ADD') {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
    } else {
      setTodos(todos.map(todo => todo.id === currentTodo.id ? { ...todo, text: inputValue.trim() } : todo));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    setLastDeletedTodo(todoToDelete);
    setTodos(todos.filter(todo => todo.id !== id));
    setUndoCountdown(5);
    setShowUndo(true);
  };

  const handleUndo = () => {
    if (lastDeletedTodo) {
      setTodos([...todos, lastDeletedTodo]);
      setShowUndo(false);
      setLastDeletedTodo(null);
    }
  };

  // ფილტრაცია და ძებნა
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'COMPLETE') return matchesSearch && todo.completed;
    if (filter === 'INCOMPLETE') return matchesSearch && !todo.completed;
    return matchesSearch;
  });

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="todo-wrapper">
        <h1>Todo List</h1>
        
        {/* კონტროლერების ბლოკი */}
        <div className="controls-header">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search note..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="COMPLETE">Complete</option>
            <option value="INCOMPLETE">Incomplete</option>
          </select>

          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* თუ სია ცარიელია */}
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <svg width="150" height="150" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="90" r="45" fill="#6C63FF" fillOpacity="0.15"/>
              <path d="M85 80C85 71.7157 91.7157 65 100 65C108.284 65 115 71.7157 115 80V110C115 118.284 108.284 125 100 125C91.7157 125 85 118.284 85 110V80Z" fill="#6C63FF" fillOpacity="0.3"/>
              <rect x="96" y="115" width="8" height="40" rx="4" fill="#6C63FF"/>
              <circle cx="100" cy="90" r="25" stroke="#6C63FF" strokeWidth="4"/>
              <line x1="117" y1="107" x2="135" y2="125" stroke="#6C63FF" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <p>Empty...</p>
          </div>
        ) : (

          <div className="todo-list">
            {filteredTodos.map(todo => (
              <div key={todo.id} className="todo-item">
                <div className="todo-item-left" onClick={() => handleToggleComplete(todo.id)}>
                  <div className={`checkbox-custom ${todo.completed ? 'checked' : ''}`}>
                    {todo.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                    {todo.text}
                  </span>
                </div>
                
                <div className="todo-actions">
                  <button className="action-btn edit" onClick={() => openEditModal(todo)}>
                    🖊️
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(todo.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* პლუს ღილაკი */}
        <button className="fab-btn" onClick={openAddModal}>+</button>

        {/* მოდალური ფანჯარა */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{modalMode === 'ADD' ? 'New Note' : 'Edit Note'}</h3>
              <form onSubmit={handleApply}>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="Input your note..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <div className="modal-actions">
                  <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-apply">Apply</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Undo შეტყობინება ქვემოთ */}
        {showUndo && (
          <div className="undo-toast">
            <span>Note deleted ({undoCountdown}s)</span>
            <button className="undo-btn" onClick={handleUndo}>
              {undoCountdown} ↩ Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}