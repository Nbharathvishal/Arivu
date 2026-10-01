import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import NotesPage from '../NotesPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockNotes = [
  { id: '1', title: 'First Note', content: 'This is the first note', userId: 'user1' },
  { id: '2', title: 'Second Note', content: 'This is the second note', userId: 'user1' },
  { id: '3', title: 'Shopping List', content: 'Buy milk and eggs', userId: 'user1' },
]

function renderNotesPage() {
  return render(
    <MemoryRouter>
      <NotesPage />
    </MemoryRouter>
  )
}

describe('NotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to "/" if no token in localStorage', () => {
    renderNotesPage()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('fetches and displays notes when token exists', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotes),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
      expect(screen.getByText('Second Note')).toBeInTheDocument()
      expect(screen.getByText('Shopping List')).toBeInTheDocument()
    })
  })

  it('displays "No notes found" when there are no notes', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText(/No notes found/)).toBeInTheDocument()
    })
  })

  it('renders header with back button and title', () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    expect(screen.getByText('← Back')).toBeInTheDocument()
    expect(screen.getByText('📒 My Notes')).toBeInTheDocument()
    expect(screen.getByText('+ New Note')).toBeInTheDocument()
  })

  it('navigates to "/main" when Back button is clicked', () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    fireEvent.click(screen.getByText('← Back'))
    expect(mockNavigate).toHaveBeenCalledWith('/main')
  })

  it('shows the note form when "+ New Note" is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    fireEvent.click(screen.getByText('+ New Note'))

    await waitFor(() => {
      expect(screen.getByText('Add Note')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Title')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Content')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  it('hides the note form when Cancel is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    // Open form
    fireEvent.click(screen.getByText('+ New Note'))
    expect(screen.getByText('Add Note')).toBeInTheDocument()

    // Close form
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Add Note')).not.toBeInTheDocument()
  })

  it('saves a new note via API and refreshes the list', async () => {
    localStorage.setItem('token', 'test-token')

    // First call: fetchNotes (initial load)
    // Second call: createNote (POST)
    // Third call: fetchNotes (after save)
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '4', title: 'New Note', content: 'New Content' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: '4', title: 'New Note', content: 'New Content' }]),
      })

    renderNotesPage()

    // Open form
    fireEvent.click(screen.getByText('+ New Note'))

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'New Note' },
    })
    fireEvent.change(screen.getByPlaceholderText('Content'), {
      target: { value: 'New Content' },
    })

    // Save
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      // Should have made the POST request
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/notes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Note', content: 'New Content' }),
        })
      )
    })
  })

  it('shows Edit Note form when edit button is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotes),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
    })

    // Click edit on first note
    const editButtons = screen.getAllByText('✏️ Edit')
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit Note')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Title')).toHaveValue('First Note')
      expect(screen.getByPlaceholderText('Content')).toHaveValue('This is the first note')
      expect(screen.getByText('Update')).toBeInTheDocument()
    })
  })

  it('deletes a note via API when delete button is clicked', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotes),
      })
      .mockResolvedValueOnce({
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotes.slice(1)),
      })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('🗑️ Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/notes/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  it('filters notes by search query', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotes),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
      expect(screen.getByText('Second Note')).toBeInTheDocument()
      expect(screen.getByText('Shopping List')).toBeInTheDocument()
    })

    // Search for "Shopping"
    fireEvent.change(screen.getByPlaceholderText('🔍 Search notes...'), {
      target: { value: 'Shopping' },
    })

    expect(screen.getByText('Shopping List')).toBeInTheDocument()
    expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument()
  })

  it('filters notes by content as well', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotes),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
    })

    // Search by content
    fireEvent.change(screen.getByPlaceholderText('🔍 Search notes...'), {
      target: { value: 'milk' },
    })

    expect(screen.getByText('Shopping List')).toBeInTheDocument()
    expect(screen.queryByText('First Note')).not.toBeInTheDocument()
  })

  it('shows "No notes found" when search yields no results', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotes),
    })

    renderNotesPage()

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('🔍 Search notes...'), {
      target: { value: 'nonexistent' },
    })

    expect(screen.getByText(/No notes found/)).toBeInTheDocument()
  })

  it('does not save a note when title is empty', async () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    fireEvent.click(screen.getByText('+ New Note'))

    // Only fill content, leave title empty
    fireEvent.change(screen.getByPlaceholderText('Content'), {
      target: { value: 'Some content' },
    })

    fireEvent.click(screen.getByText('Save'))

    // Only the initial fetchNotes call should have been made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('renders search input', () => {
    localStorage.setItem('token', 'test-token')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    renderNotesPage()

    expect(screen.getByPlaceholderText('🔍 Search notes...')).toBeInTheDocument()
  })
})
