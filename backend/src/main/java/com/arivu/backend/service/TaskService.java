package com.arivu.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arivu.backend.model.Task;
import com.arivu.backend.repository.TaskRepository;

@Service
public class TaskService {
    @Autowired
    TaskRepository taskRepository;

    public List<Task> getAllTasksByUserId(String userId) {
        return taskRepository.findByUserId(userId);
    }

    public Optional<Task> getTaskById(String id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task taskUpdates) {
        if (taskRepository.existsById(id)) {
            taskUpdates.setId(id);
            return taskRepository.save(taskUpdates);
        }
        return null;
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
}
