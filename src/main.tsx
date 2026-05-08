import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import App from './App';
import EmptyPage from './EmptyPage';
import StatementPage2 from './StatementPage2';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/empty" element={<EmptyPage />} />
        <Route path="/statement-2" element={<StatementPage2 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
