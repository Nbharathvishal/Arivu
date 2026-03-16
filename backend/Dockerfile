# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
# This caches the dependencies layer unless pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the actual source code and build the application
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the minimal runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy only the built JAR from the builder stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render uses the PORT environment variable, defaulting to 8080)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
