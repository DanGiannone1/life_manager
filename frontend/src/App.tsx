// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './state/syncEngine';
import { Toaster } from "@/components/ui/toaster";
import "@/components/animations/animations.css";

// Pages
import HomePage from './pages/HomePage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import MasterListPage from './pages/MasterListPage';

// Layout components
import { AppLayout } from './components/layouts/AppLayout';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
            <Route path="/master-list" element={<MasterListPage />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </Provider>
  );
}

export default App;