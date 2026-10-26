import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChat from "./components/AIChat";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Prediction from "./pages/Prediction";
import DatasetPreview from "./pages/DatasetPreview";
import Analytics from "./pages/Analytics";
import { useLocation } from "react-router-dom";

// Helper component to restrict AI Chat visibility
const ConditionalAIChat = ({ isLoggedIn, isOpen, setIsOpen, lastPrediction }) => {
  const location = useLocation();
  const allowedPaths = ["/dashboard", "/prediction"];

  if (!isLoggedIn || !allowedPaths.includes(location.pathname)) {
    return null;
  }

  return <AIChat isOpen={isOpen} setIsOpen={setIsOpen} lastPrediction={lastPrediction} />;
};

// Wrapper to handle conditional layout shift based on route
const LayoutWrapper = ({ children, isChatOpen }) => {
  const location = useLocation();
  const allowedPaths = ["/dashboard", "/prediction"];
  const shouldShift = isChatOpen && allowedPaths.includes(location.pathname);

  return (
    <div className={`main-app-content ${shouldShift ? 'chat-sidebar-open' : ''}`}>
      {children}
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setUserName(userData.username);

    // Persist to localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userName", userData.username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserName(null);
    setIsChatOpen(false);
    setLastPrediction(null);

    // Clear localStorage
    localStorage.clear();
  };

  return (
    <Router>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <LayoutWrapper isChatOpen={isChatOpen}>
        <Routes>
          {/* '/' always shows landing page regardless of login state */}
          <Route path="/" element={<Home isLoggedIn={false} userName={userName} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {isLoggedIn && (
            <>
              {/* '/dashboard' is the post-login home */}
              <Route path="/dashboard" element={<Home isLoggedIn={true} userName={userName} />} />
              <Route
                path="/prediction"
                element={<Prediction userEmail={userEmail} setLastPrediction={setLastPrediction} />}
              />
              <Route path="/dataset" element={<DatasetPreview />} />
              <Route path="/analytics" element={<Analytics />} />
            </>
          )}
        </Routes>
      </LayoutWrapper>
      <ConditionalAIChat
        isLoggedIn={isLoggedIn}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        lastPrediction={lastPrediction}
      />
      <Footer />
    </Router>
  );
}

export default App;
