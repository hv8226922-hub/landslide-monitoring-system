// Set VITE_API_URL to your backend API root in the deployment environment.
// Example: https://your-backend.example.com/api
const configuredApiUrl = import.meta.env.VITE_API_URL

export const API_BASE_URL = (
  configuredApiUrl || 'http://127.0.0.1:5000/api'
).replace(/\/+$/, '')
