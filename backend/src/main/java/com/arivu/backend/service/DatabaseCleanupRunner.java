package com.arivu.backend.service;

import com.arivu.backend.model.User;
import com.arivu.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DatabaseCleanupRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseCleanupRunner.class);

    private final UserRepository userRepository;

    public DatabaseCleanupRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Starting database duplicate user cleanup...");
            List<User> allUsers = userRepository.findAll();
            Map<String, List<User>> usersByEmail = allUsers.stream()
                    .filter(u -> u.getEmail() != null)
                    .collect(Collectors.groupingBy(User::getEmail));

            int deletedCount = 0;
            for (Map.Entry<String, List<User>> entry : usersByEmail.entrySet()) {
                List<User> list = entry.getValue();
                if (list.size() > 1) {
                    logger.warn("Found {} duplicate users for email: {}", list.size(), entry.getKey());
                    // Keep the first one, delete the rest
                    for (int i = 1; i < list.size(); i++) {
                        User duplicate = list.get(i);
                        logger.warn("Deleting duplicate user ID: {}", duplicate.getId());
                        userRepository.delete(duplicate);
                        deletedCount++;
                    }
                }
            }
            logger.info("Database cleanup completed. Deleted {} duplicate user record(s).", deletedCount);
        } catch (Exception e) {
            logger.error("Failed to run database duplicate user cleanup: {}", e.getMessage());
        }
    }
}
