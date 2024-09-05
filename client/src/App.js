import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BlockList from './components/BlockList';
import BlockPage from './components/BlockPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlockList />} />
        <Route path="/block/:blockId" element={<BlockPage />} />
      </Routes>
    </Router>
  );
}

export default App;
