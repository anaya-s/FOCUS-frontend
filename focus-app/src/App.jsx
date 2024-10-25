import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; ;
import Login from './Login';
import CreateAccount from './CreateAccount';

function App() {
  return (
    <Router>
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/create-account" element={<CreateAccount/>} />
        </Routes>
    </Router>
  );
}

export default App;