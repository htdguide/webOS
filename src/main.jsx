/* main.jsx */
import { StrictMode, Suspense, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';
import Wallpaper from './components/Wallpaper/Wallpaper.jsx';

const Main = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300); // Simulate loading time
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      const loadingScreen = document.querySelector('.loading-screen');
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 1000);
    }
  }, [loading]);

  return (
    <StrictMode>
      <div>
        <div className={`loading-screen${loading ? '' : ' fade-out'}`}>
          <LoadingScreen />
        </div>
        <Wallpaper />
        <App />
      </div>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);