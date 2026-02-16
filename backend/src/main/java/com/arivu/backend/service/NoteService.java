package com.arivu.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arivu.backend.model.Note;
import com.arivu.backend.repository.NoteRepository;

@Service
public class NoteService {
    @Autowired
    NoteRepository noteRepository;

    public List<Note> getAllNotesByUserId(String userId) {
        return noteRepository.findByUserId(userId);
    }

    public Optional<Note> getNoteById(String id) {
        return noteRepository.findById(id);
    }

    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    public Note updateNote(String id, Note noteUpdates) {
        if (noteRepository.existsById(id)) {
            noteUpdates.setId(id);
            return noteRepository.save(noteUpdates);
        }
        return null;
    }

    public void deleteNote(String id) {
        noteRepository.deleteById(id);
    }
}
