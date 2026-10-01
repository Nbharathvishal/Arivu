import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Registration from '../registration'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderRegistration() {
  return render(
    <MemoryRouter>
      <Registration />
    </MemoryRouter>
  )
}

describe('Registration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders registration form with all fields', () => {
    renderRegistration()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('allows typing in all fields', () => {
    renderRegistration()

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const confirmInput = screen.getByPlaceholderText('Confirm your password')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmInput, { target: { value: 'password123' } })

    expect(nameInput.value).toBe('John Doe')
    expect(emailInput.value).toBe('john@example.com')
    expect(passwordInput.value).toBe('password123')
    expect(confirmInput.value).toBe('password123')
  })

  it('shows error when passwords do not match', async () => {
    renderRegistration()

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'differentpassword' },
    })

    fireEvent.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    // Should NOT have called fetch
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('navigates to "/" on successful registration', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful' }),
    })

    renderRegistration()

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays error message on failed registration', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Email already exists' }),
    })

    renderRegistration()

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'existing@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('displays generic error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    renderRegistration()

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(screen.getByText('An error occurred during registration')).toBeInTheDocument()
    })
  })

  it('navigates to "/" when Login link is clicked', () => {
    renderRegistration()
    const loginLink = screen.getByText('Login')
    fireEvent.click(loginLink)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('sends correct data to API on registration', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful' }),
    })

    renderRegistration()

    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByText('Register'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      )
    })
  })
})
