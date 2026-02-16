package com.arivu.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.arivu.backend.model.Note;

public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByUserId(String userId);
}
