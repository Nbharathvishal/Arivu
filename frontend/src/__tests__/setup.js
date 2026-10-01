import '@testing-library/jest-dom'

// Mock import.meta.env
if (!import.meta.env.VITE_BACKEND_URL) {
  import.meta.env.VITE_BACKEND_URL = 'http://localhost:8080'
}
