import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import CaseViewer from './CaseViewer';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case/:caseId" element={<CaseViewer />} />
    </Routes>
  );
}
