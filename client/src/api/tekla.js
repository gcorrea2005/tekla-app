import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const teklaApi = {
  // Status
  getStatus: () => api.get('/status'),

  // Model
  getBeams: () => api.get('/beams'),
  getSelectedBeams: () => api.get('/beams/selected'),
  getColumns: () => api.get('/columns'),
  getObjects: () => api.get('/objects'),

  // Components
  getComponents: () => api.get('/components'),

  // Remote (OneDrive IFC)
  getRemoteStatus: () => api.get('/remote/status'),
  getRemoteFiles: () => api.get('/remote/ifc-files'),
  getRemoteBeams: (fileId) => api.get('/remote/beams', { params: { fileId } }),

  // Connections
  applyConnection: (data) => api.post('/connections', data),
  applyAdvanced: (data) => api.post('/connections/advanced', data),
  applyBatch: (connections) => api.post('/connections/batch', { connections }),
  deleteConnection: (id) => api.delete(`/connections/${id}`),
};

export default teklaApi;
