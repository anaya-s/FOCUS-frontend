import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import HomePage from './home/HomePage'; 

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Links */}
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
