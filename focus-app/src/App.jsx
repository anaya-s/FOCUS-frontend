import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import HomePage from './home/HomePage';
import LoginPage from './login/LoginPage';
import CalibrationPage from './calibration/calibration';
import NavBar from './home/NavBar'; 
import Footer from './home/Footer';

function App() {
  return (
    <Router>
      <div>
        <NavBar />
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
