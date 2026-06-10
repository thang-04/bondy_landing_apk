import { api, unwrap } from '@/lib/api'

export const surveysApi = {
  list(params = {}) {
    return unwrap(api.get('/admin/surveys', { params }))
  },
  get(id) {
    return unwrap(api.get(`/admin/surveys/${id}`))
  },
  create(payload) {
    return unwrap(api.post('/admin/surveys', payload))
  },
  update(id, payload) {
    return unwrap(api.patch(`/admin/surveys/${id}`, payload))
  },
  remove(id) {
    return unwrap(api.delete(`/admin/surveys/${id}`))
  },
  submissions(id, params = {}) {
    return unwrap(api.get(`/admin/surveys/${id}/submissions`, { params }))
  },
}

export const templatesApi = {
  list(params = {}) {
    return unwrap(api.get('/admin/survey-templates', { params }))
  },
  get(id) {
    return unwrap(api.get(`/admin/survey-templates/${id}`))
  },
  create(payload) {
    return unwrap(api.post('/admin/survey-templates', payload))
  },
  update(id, payload) {
    return unwrap(api.patch(`/admin/survey-templates/${id}`, payload))
  },
  remove(id) {
    return unwrap(api.delete(`/admin/survey-templates/${id}`))
  },
}
