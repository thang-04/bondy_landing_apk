import { api, unwrap } from '@/lib/api'

export const audiosApi = {
  list(params) { return unwrap(api.get('/admin/healing/audios', { params })) },
  get(id) { return unwrap(api.get(`/admin/healing/audios/${id}`)) },
  create(payload) { return unwrap(api.post('/admin/healing/audios', payload)) },
  update(id, payload) { return unwrap(api.patch(`/admin/healing/audios/${id}`, payload)) },
  remove(id) { return unwrap(api.delete(`/admin/healing/audios/${id}`)) },
  upload(file) {
    const fd = new FormData()
    fd.append('file', file)
    return unwrap(api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
  },
}
