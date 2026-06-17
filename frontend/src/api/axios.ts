import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ratenest_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('ratenest_token')
      if (hadToken) {
        // Session expired — force logout and reload
        localStorage.removeItem('ratenest_token')
        localStorage.removeItem('ratenest_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
