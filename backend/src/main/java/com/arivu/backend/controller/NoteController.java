package com.arivu.backend.controller;

import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.arivu.backend.model.Note;
import com.arivu.backend.security.UserDetailsImpl;
import com.arivu.backend.service.NoteService;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    NoteService noteService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.getAllNotesByUserId(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNote(@PathVariable String id) {
        return noteService.getNoteById(id)
                .map(note -> {
                    if (!note.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<Note>(HttpStatus.FORBIDDEN);
                    }
                    return new ResponseEntity<>(note, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        note.setUserId(getCurrentUserId());
        return noteService.createNote(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable String id, @RequestBody Note noteUpdates) {
        return noteService.getNoteById(id)
                .map(existingNote -> {
                    if (!existingNote.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<Note>(HttpStatus.FORBIDDEN);
                    }
                    if (noteUpdates.getTitle() != null)
                        existingNote.setTitle(noteUpdates.getTitle());
                    if (noteUpdates.getContent() != null)
                        existingNote.setContent(noteUpdates.getContent());

                    existingNote.setPinned(noteUpdates.isPinned());
                    existingNote.setTrashed(noteUpdates.isTrashed());
                    if (noteUpdates.isTrashed())
                        existingNote.setDeletedAt(new Date());
                    else
                        existingNote.setDeletedAt(null);

                    existingNote.setUpdatedAt(new Date());

                    Note updated = noteService.updateNote(id, existingNote);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id) {
        return noteService.getNoteById(id)
                .map(existingNote -> {
                    if (!existingNote.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    }
                    noteService.deleteNote(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
