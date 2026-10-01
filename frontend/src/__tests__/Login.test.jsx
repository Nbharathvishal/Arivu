import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Login from '../Login'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders login form with email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renders Arivu branding', () => {
    renderLogin()
    const arivuTexts = screen.getAllByText('Arivu')
    expect(arivuTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders punch text', () => {
    renderLogin()
    expect(screen.getByText('Unlock Your Learning Potential')).toBeInTheDocument()
  })

  it('allows typing in email field', () => {
    renderLogin()
    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput.value).toBe('test@example.com')
  })

  it('allows typing in password field', () => {
    renderLogin()
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } })
    expect(passwordInput.value).toBe('mypassword')
  })

  it('toggles password visibility when show/hide button is clicked', () => {
    renderLogin()
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const toggleButton = screen.getByText('👁️')

    // Initially password is hidden
    expect(passwordInput.type).toBe('password')

    // Click to show
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    // Click to hide again
    fireEvent.click(screen.getByText('🙈'))
    expect(passwordInput.type).toBe('password')
  })

  it('navigates to /register when Sign Up link is clicked', () => {
    renderLogin()
    const signUpLink = screen.getByText('Sign Up')
    fireEvent.click(signUpLink)
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('navigates to /reset-password when Forgot Password link is clicked', () => {
    renderLogin()
    const forgotLink = screen.getByText('Forgot Password?')
    fireEvent.click(forgotLink)
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password')
  })

  it('navigates to /main on successful login', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'test-jwt-token', message: 'Login successful' }),
    })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })

    // Find the Login button (it's the one inside login-btn div)
    const loginButtons = screen.getAllByText('Login')
    const loginButton = loginButtons.find(el => el.tagName === 'BUTTON')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/main')
    })

    expect(localStorage.getItem('token')).toBe('test-jwt-token')
  })

  it('displays error message on failed login', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid email or password' }),
    })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' },
    })

    const loginButtons = screen.getAllByText('Login')
    const loginButton = loginButtons.find(el => el.tagName === 'BUTTON')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('displays generic error message on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    })

    const loginButtons = screen.getAllByText('Login')
    const loginButton = loginButtons.find(el => el.tagName === 'BUTTON')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred during login')).toBeInTheDocument()
    })
  })

  it('renders Google login button', () => {
    renderLogin()
    expect(screen.getByText('Login with Google')).toBeInTheDocument()
  })
})
