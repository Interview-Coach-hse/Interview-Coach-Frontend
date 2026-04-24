import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AdminRoute, ProtectedRoute } from "@/app/router/guards";
import { AdminLayout } from "@/shared/layouts/AdminLayout";
import { AppLayout } from "@/shared/layouts/AppLayout";
import { PublicLayout } from "@/shared/layouts/PublicLayout";
import { RouteErrorBoundary } from "@/shared/ui";
import { AdminProfilesPage } from "@/pages/admin/AdminProfilesPage";
import { AdminProfileEditPage } from "@/pages/admin/AdminProfileEditPage";
import { AdminQuestionsPage } from "@/pages/admin/AdminQuestionsPage";
import { AdminUserDetailPage } from "@/pages/admin/AdminUserDetailPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { DashboardPage } from "@/pages/app/DashboardPage";
import { HistoryPage } from "@/pages/app/HistoryPage";
import { SessionDetailPage } from "@/pages/app/SessionDetailPage";
import { SessionHistoryDetailPage } from "@/pages/app/SessionHistoryDetailPage";
import { SessionReportPage } from "@/pages/app/SessionReportPage";
import { SettingsPage } from "@/pages/app/SettingsPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { ProfileDetailsPage } from "@/pages/public/ProfileDetailsPage";
import { ProfilesPage } from "@/pages/public/ProfilesPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/public/VerifyEmailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/profiles" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "profiles", element: <ProfilesPage /> },
      { path: "profiles/:profileId", element: <ProfileDetailsPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "profiles", element: <ProfilesPage /> },
          { path: "profiles/:profileId", element: <ProfileDetailsPage /> },
          { path: "history", element: <HistoryPage /> },
          { path: "history/:sessionId", element: <SessionHistoryDetailPage /> },
          { path: "sessions/:sessionId", element: <SessionDetailPage /> },
          { path: "sessions/:sessionId/report", element: <SessionReportPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            errorElement: <RouteErrorBoundary />,
            children: [
              { index: true, element: <Navigate to="/admin/users" replace /> },
              { path: "users", element: <AdminUsersPage /> },
              { path: "users/:userId", element: <AdminUserDetailPage /> },
              { path: "questions", element: <AdminQuestionsPage /> },
              { path: "profiles", element: <AdminProfilesPage /> },
              { path: "profiles/new", element: <AdminProfileEditPage /> },
              { path: "profiles/:profileId/edit", element: <AdminProfileEditPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
