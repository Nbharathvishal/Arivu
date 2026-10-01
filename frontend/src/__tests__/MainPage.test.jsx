import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MainPage from '../MainPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderMainPage() {
  return render(
    <MemoryRouter>
      <MainPage />
    </MemoryRouter>
  )
}

describe('MainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to "/" if no token in localStorage', async () => {
    renderMainPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('fetches and displays user name when token exists', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John Doe', email: 'john@example.com' }),
    })

    renderMainPage()

    await waitFor(() => {
      expect(screen.getByText(/Hello, John Doe/)).toBeInTheDocument()
    })
  })

  it('displays "User" as default name while loading', () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

    renderMainPage()

    expect(screen.getByText(/Hello, User/)).toBeInTheDocument()
  })

  it('redirects to "/" if user fetch fails', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    })

    renderMainPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('redirects to "/" on network error', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    renderMainPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('renders Notes and Documents workspace cards', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    expect(screen.getByText('📒 Notes')).toBeInTheDocument()
    expect(screen.getByText('📄 Documents')).toBeInTheDocument()
    expect(screen.getByText('Choose your workspace')).toBeInTheDocument()
  })

  it('navigates to "/main/notes" when Notes card is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    const notesCard = screen.getByText('📒 Notes').closest('.card')
    fireEvent.click(notesCard)

    expect(mockNavigate).toHaveBeenCalledWith('/main/notes')
  })

  it('navigates to "/main/documents" when Documents card is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    const docsCard = screen.getByText('📄 Documents').closest('.card')
    fireEvent.click(docsCard)

    expect(mockNavigate).toHaveBeenCalledWith('/main/documents')
  })

  it('navigates to "/profile" when Profile button is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    fireEvent.click(screen.getByText('Profile'))

    expect(mockNavigate).toHaveBeenCalledWith('/profile')
  })

  it('navigates to "/main" when logo is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    fireEvent.click(screen.getByText('Arivu'))

    expect(mockNavigate).toHaveBeenCalledWith('/main')
  })

  it('sends Authorization header with token in API request', async () => {
    localStorage.setItem('token', 'my-jwt-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'John', email: 'john@example.com' }),
    })

    renderMainPage()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/user',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer my-jwt-token',
          },
        })
      )
    })
  })
})
