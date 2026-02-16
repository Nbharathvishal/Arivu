package com.arivu.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.arivu.backend.model.Task;
import com.arivu.backend.security.UserDetailsImpl;
import com.arivu.backend.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    TaskService taskService;

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasksByUserId(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable String id) {
        return taskService.getTaskById(id)
                .map(task -> {
                    if (!task.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<Task>(HttpStatus.FORBIDDEN);
                    }
                    return new ResponseEntity<>(task, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setUserId(getCurrentUserId());
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task taskUpdates) {
        return taskService.getTaskById(id)
                .map(existingTask -> {
                    if (!existingTask.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<Task>(HttpStatus.FORBIDDEN);
                    }
                    existingTask.setTitle(taskUpdates.getTitle());
                    existingTask.setDescription(taskUpdates.getDescription());
                    existingTask.setCompleted(taskUpdates.isCompleted());
                    existingTask.setDeadline(taskUpdates.getDeadline());
                    existingTask.setPriority(taskUpdates.getPriority());

                    Task updated = taskService.updateTask(id, existingTask);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        return taskService.getTaskById(id)
                .map(existingTask -> {
                    if (!existingTask.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    }
                    taskService.deleteTask(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
