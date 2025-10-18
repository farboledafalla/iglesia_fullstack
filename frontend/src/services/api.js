import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const courseService = {
  getCourses: () => api.get('/courses'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
};

export const inscripcionesService = {
  create: (data) => api.post('/inscripciones', data),
  listByAlumno: (alumno_id) => api.get('/inscripciones', { params: { alumno_id } }),
  update: (id, data) => api.patch(`/inscripciones/${id}`, data),
};

export const intentosService = {
  startAttempt: (leccion_id, alumno_id) => api.post(`/intentos/lecciones/${leccion_id}`, { alumno_id }),
  getAttempt: (attempt_id) => api.get(`/intentos/${attempt_id}`),
  submitAttempt: (attempt_id, answers) => api.post(`/intentos/${attempt_id}/submit`, { answers }),
};

export const preguntasService = {
  create: (data) => api.post('/preguntas', data),
  get: (id) => api.get(`/preguntas/${id}`),
};

export default api; 