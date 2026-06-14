import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from './i18n';
import LoadingScreen from './components/LoadingScreen';
import './styles/styles.css';

function MainApp() {
  const [appReady, setAppReady] = useState(false);
  useEffect(() => {
    i18n.init().then(() => setAppReady(true));
  }, []);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
