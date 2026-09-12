import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { appRoutes } from "@/app/config/routes";

const HomePage = lazy(() =>
  import("@/features/feed/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const ExplorePage = lazy(() =>
  import("@/features/explore/pages/ExplorePage").then((module) => ({ default: module.ExplorePage })),
);
const FilesPage = lazy(() =>
  import("@/features/files/pages/FilesPage").then((module) => ({ default: module.FilesPage })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);
const ChatPage = lazy(() =>
  import("@/features/chat/pages/ChatPage").then((module) => ({ default: module.ChatPage })),
);
const SpacesPage = lazy(() =>
  import("@/features/spaces/pages/SpacesPage").then((module) => ({ default: module.SpacesPage })),
);
const NotificationsPage = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);
const SearchPage = lazy(() =>
  import("@/features/search/pages/SearchPage").then((module) => ({ default: module.SearchPage })),
);
const DocumentViewerPage = lazy(() =>
  import("@/features/viewer/pages/DocumentViewerPage").then((module) => ({
    default: module.DocumentViewerPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import("@/features/system/pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const NamedPlaceholder = lazy(() =>
  import("@/features/system/pages/NamedPlaceholder").then((module) => ({
    default: module.NamedPlaceholder,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas font-body text-sm text-cx-muted">
      Loading ConnectX…
    </div>
  );
}

function Guarded({ title }: { title: string }) {
  return (
    <ProtectedRoute>
      <NamedPlaceholder title={title} />
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={appRoutes.root} element={<Navigate to={appRoutes.home} replace />} />
          <Route
            path={appRoutes.home}
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.explore}
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route path={appRoutes.create} element={<Navigate to={appRoutes.home} replace />} />
          <Route
            path={appRoutes.chat}
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.chatThread}
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.spaces}
            element={
              <ProtectedRoute>
                <SpacesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.space}
            element={
              <ProtectedRoute>
                <SpacesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.spaceChannel}
            element={
              <ProtectedRoute>
                <SpacesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.files}
            element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.file}
            element={
              <ProtectedRoute>
                <DocumentViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.profile}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.profileUser}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.notifications}
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.search}
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.document}
            element={
              <ProtectedRoute>
                <DocumentViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.settings}
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.settingsAccount}
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.settingsPrivacy}
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.settingsNotifications}
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={appRoutes.settingsSecurity}
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path={appRoutes.post} element={<Guarded title="Post" />} />
          <Route path={appRoutes.media} element={<Guarded title="Media" />} />
          <Route path={appRoutes.login} element={<LoginPage />} />
          <Route path={appRoutes.signup} element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
