package com.arivu.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    // Test 1: Simplest possible GET
    @GetMapping("/hello")
    public String hello() {
        System.out.println("✅ GET /hello called");
        return "Hello World! GET works!";
    }

    // Test 2: Simplest possible POST (no parameters)
    @PostMapping("/simplepost")
    public String simplePost() {
        System.out.println("✅ POST /simplepost called");
        return "POST received! POST works!";
    }
}