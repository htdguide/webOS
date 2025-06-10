// main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Efi from '../src/efi/Efi';


const Main = () => {

  return (
    <StrictMode>  
       <Efi/>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
