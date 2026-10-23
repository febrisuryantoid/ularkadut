import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupPWAAutoUpdate } from './pwa.ts';

// Initialize PWA auto-update
setupPWAAutoUpdate();

createRoot(document.getElementById('root')!).render(<App />);

