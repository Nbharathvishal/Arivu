package com.arivu.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.arivu.backend.model.UserDocument;

public interface DocumentRepository extends MongoRepository<UserDocument, String> {
    List<UserDocument> findByUserId(String userId);
}
