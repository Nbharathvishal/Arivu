package com.arivu.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.arivu.backend.model.Task;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserId(String userId);
}
