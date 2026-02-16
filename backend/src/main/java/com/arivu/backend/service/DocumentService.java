package com.arivu.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arivu.backend.model.UserDocument;
import com.arivu.backend.repository.DocumentRepository;

@Service
public class DocumentService {
    @Autowired
    DocumentRepository documentRepository;

    public List<UserDocument> getAllDocumentsByUserId(String userId) {
        return documentRepository.findByUserId(userId);
    }

    public Optional<UserDocument> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    public UserDocument save(UserDocument doc) {
        return documentRepository.save(doc);
    }

    public void delete(String id) {
        documentRepository.deleteById(id);
    }
}
