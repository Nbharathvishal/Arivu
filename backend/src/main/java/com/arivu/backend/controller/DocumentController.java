package com.arivu.backend.controller;

import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.arivu.backend.model.UserDocument;
import com.arivu.backend.security.UserDetailsImpl;
import com.arivu.backend.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    DocumentService documentService;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<UserDocument> getAllDocuments() {
        return documentService.getAllDocumentsByUserId(getCurrentUserId());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("title") String title,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam("file") MultipartFile file) {

        try {
            UserDocument doc = new UserDocument();
            doc.setUserId(getCurrentUserId());
            doc.setTitle(title);
            doc.setNote(note);
            doc.setFileName(file.getOriginalFilename());
            doc.setContentType(file.getContentType());
            doc.setData(file.getBytes());

            UserDocument savedDoc = documentService.save(doc);
            return ResponseEntity.ok(savedDoc);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> getFile(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(doc -> {
                    if (!doc.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<byte[]>(HttpStatus.FORBIDDEN);
                    }

                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "attachment; filename=\"" + doc.getFileName() + "\"")
                            .contentType(MediaType.parseMediaType(doc.getContentType()))
                            .body(doc.getData());
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(@PathVariable String id, @RequestBody UserDocument docUpdates) {
        return documentService.getDocumentById(id)
                .map(existingDoc -> {
                    if (!existingDoc.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    }
                    // Only update editable fields
                    if (docUpdates.getTitle() != null)
                        existingDoc.setTitle(docUpdates.getTitle());
                    if (docUpdates.getNote() != null)
                        existingDoc.setNote(docUpdates.getNote());

                    // Force update isTrashed if present
                    // Note: isTrashed is boolean primitive, so it's always true/false.
                    // We need to trust the frontend sends the right state.
                    existingDoc.setTrashed(docUpdates.isTrashed());

                    documentService.save(existingDoc);
                    return ResponseEntity.ok(existingDoc);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(existingDoc -> {
                    if (!existingDoc.getUserId().equals(getCurrentUserId())) {
                        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                    }
                    documentService.delete(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
