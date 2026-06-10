import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { UsersListPage } from '@/features/users/UsersListPage'
import { UserDetailPage } from '@/features/users/UserDetailPage'
import { SurveysListPage } from '@/features/surveys/SurveysListPage'
import { SurveyFormPage } from '@/features/surveys/SurveyFormPage'
import { SurveySubmissionsPage } from '@/features/surveys/SurveySubmissionsPage'
import { TemplatesPage } from '@/features/surveys/TemplatesPage'
import { ArticlesListPage } from '@/features/healing/articles/ArticlesListPage'
import { ArticleFormPage } from '@/features/healing/articles/ArticleFormPage'
import { AudiosListPage } from '@/features/healing/audios/AudiosListPage'
import { AudioFormPage } from '@/features/healing/audios/AudioFormPage'
import { ExercisesListPage } from '@/features/healing/exercises/ExercisesListPage'
import { ExerciseFormPage } from '@/features/healing/exercises/ExerciseFormPage'
import { PlansListPage } from '@/features/healing/plans/PlansListPage'
import { PlanFormPage } from '@/features/healing/plans/PlanFormPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />

        <Route path="/surveys" element={<SurveysListPage />} />
        <Route path="/surveys/new" element={<SurveyFormPage />} />
        <Route path="/surveys/:id" element={<SurveyFormPage />} />
        <Route path="/surveys/:id/submissions" element={<SurveySubmissionsPage />} />

        <Route path="/survey-templates" element={<TemplatesPage />} />

        <Route path="/healing/articles" element={<ArticlesListPage />} />
        <Route path="/healing/articles/new" element={<ArticleFormPage />} />
        <Route path="/healing/articles/:id" element={<ArticleFormPage />} />

        <Route path="/healing/audios" element={<AudiosListPage />} />
        <Route path="/healing/audios/new" element={<AudioFormPage />} />
        <Route path="/healing/audios/:id" element={<AudioFormPage />} />

        <Route path="/healing/exercises" element={<ExercisesListPage />} />
        <Route path="/healing/exercises/new" element={<ExerciseFormPage />} />
        <Route path="/healing/exercises/:id" element={<ExerciseFormPage />} />

        <Route path="/healing/plans" element={<PlansListPage />} />
        <Route path="/healing/plans/new" element={<PlanFormPage />} />
        <Route path="/healing/plans/:id" element={<PlanFormPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
