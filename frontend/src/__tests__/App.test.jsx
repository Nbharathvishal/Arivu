import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from '../App'

// Helper to render App at a specific route
function renderAtRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

describe('App Routing', () => {
  it('renders Login page on "/" route', () => {
    renderAtRoute('/')
    // Login page has "Arivu" text and email input
    expect(screen.getAllByText('Arivu').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('renders Registration page on "/register" route', () => {
    renderAtRoute('/register')
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
  })

  it('renders ResetPassword page on "/reset-password" route', () => {
    renderAtRoute('/reset-password')
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
  })
})
