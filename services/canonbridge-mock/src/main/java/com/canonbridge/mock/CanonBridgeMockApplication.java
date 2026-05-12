package com.canonbridge.mock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CanonBridgeMockApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanonBridgeMockApplication.class, args);
    }
}
