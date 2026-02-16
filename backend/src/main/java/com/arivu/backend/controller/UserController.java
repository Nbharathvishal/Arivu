package com.arivu.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arivu.backend.model.User;
import com.arivu.backend.repository.UserRepository;
import com.arivu.backend.security.UserDetailsImpl;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetailsImpl) authentication.getPrincipal()).getEmail();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User userUpdates) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = ((UserDetailsImpl) authentication.getPrincipal()).getEmail();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Update fields only if they are not null
        if (userUpdates.getName() != null)
            user.setName(userUpdates.getName());
        if (userUpdates.getDob() != null)
            user.setDob(userUpdates.getDob());
        if (userUpdates.getBloodGroup() != null)
            user.setBloodGroup(userUpdates.getBloodGroup());
        if (userUpdates.getMobile() != null)
            user.setMobile(userUpdates.getMobile());
        if (userUpdates.getAltMobile() != null)
            user.setAltMobile(userUpdates.getAltMobile());
        if (userUpdates.getAadhar() != null)
            user.setAadhar(userUpdates.getAadhar());
        if (userUpdates.getPan() != null)
            user.setPan(userUpdates.getPan());
        if (userUpdates.getQualification() != null)
            user.setQualification(userUpdates.getQualification());
        if (userUpdates.getDrivingLicense() != null)
            user.setDrivingLicense(userUpdates.getDrivingLicense());
        if (userUpdates.getVoterId() != null)
            user.setVoterId(userUpdates.getVoterId());
        if (userUpdates.getSmartCard() != null)
            user.setSmartCard(userUpdates.getSmartCard());
        if (userUpdates.getPassport() != null)
            user.setPassport(userUpdates.getPassport());
        if (userUpdates.getBankAccount() != null)
            user.setBankAccount(userUpdates.getBankAccount());
        if (userUpdates.getProfileImg() != null)
            user.setProfileImg(userUpdates.getProfileImg());

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}
