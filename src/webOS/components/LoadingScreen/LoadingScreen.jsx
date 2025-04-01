import React from 'react';
import './LoadingScreen.css';
import loadingCircle from '../../media/animations/loadingCircle.gif';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <img src={loadingCircle} alt="Loading..." className="loading-gif" />
    </div>
  );
};

export default LoadingScreen;
