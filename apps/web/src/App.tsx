import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Rooms } from './pages/Rooms';
import { Subjects } from './pages/Subjects';
import { Teachers } from './pages/Teachers';
import { Students } from './pages/Students';
import { Activities } from './pages/Activities';
import { Sections } from './pages/Sections';
import { Scheduler } from './pages/Scheduler';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { EmptyState } from './components/shared/FeedbackStates';
import { Settings } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperationalPage, operationalConfigs } from './pages/OperationalPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
        <BrowserRouter>
          <Routes>
            {/* Public Redirection Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Authentication Pages (AuthLayout) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard Workspace Pages (DashboardLayout) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="scheduler" element={<Scheduler />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="students" element={<Students />} />
              <Route path="activities" element={<Activities />} />
              <Route path="sections" element={<Sections />} />
              <Route path="constraints" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="branches" element={<OperationalPage {...operationalConfigs.branches} />} />
              <Route path="buildings" element={<OperationalPage {...operationalConfigs.buildings} />} />
              <Route path="floors" element={<OperationalPage {...operationalConfigs.floors} />} />
              <Route path="subject-groups" element={<OperationalPage {...operationalConfigs.subjectGroups} />} />
              <Route path="batches" element={<OperationalPage {...operationalConfigs.batches} />} />
              <Route path="holidays" element={<OperationalPage {...operationalConfigs.holidays} />} />
              <Route path="events" element={<OperationalPage {...operationalConfigs.events} />} />
              <Route path="absences" element={<OperationalPage {...operationalConfigs.absences} />} />
              <Route path="homework" element={<OperationalPage {...operationalConfigs.homework} />} />
              <Route path="attendance" element={<OperationalPage {...operationalConfigs.attendance} />} />
              <Route path="exams" element={<OperationalPage {...operationalConfigs.exams} />} />
              <Route path="bookings" element={<OperationalPage {...operationalConfigs.bookings} />} />
              <Route
                path="settings"
                element={
                  <div className="p-8">
                    <EmptyState
                      title="Institution Settings"
                      description="Change school calendar hours, break timings, default time periods, and MFA tokens. Coming soon."
                      icon={<Settings className="h-6 w-6 text-slate-500" />}
                    />
                  </div>
                }
              />
            </Route>

            {/* Fallback 404 handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
