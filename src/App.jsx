import React from 'react'
import { Route, Routes } from "react-router-dom";
import ProductApp from './shop';
import Developer from './developer';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<ProductApp />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
    </div>
  )
}

export default App