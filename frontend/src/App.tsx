import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { ROUTES } from "@/lib/navigation";
import { MasterList } from "@/pages/MasterList";

// Placeholder pages
const Home = () => <div>Home Page</div>;
const WeeklyPlan = () => <div>Weekly Plan Page</div>;
const Settings = () => <div>Settings Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path={ROUTES.WEEKLY_PLAN}
          element={
            <AppLayout>
              <WeeklyPlan />
            </AppLayout>
          }
        />
        <Route
          path={ROUTES.MASTER_LIST}
          element={
            <AppLayout>
              <MasterList />
            </AppLayout>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <AppLayout containerWidth="sm">
              <Settings />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
