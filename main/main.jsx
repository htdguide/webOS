// main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BIOS from '../src/BIOS/BIOS';


const Main = () => {

  return (
    <StrictMode>  
       <BIOS/>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
