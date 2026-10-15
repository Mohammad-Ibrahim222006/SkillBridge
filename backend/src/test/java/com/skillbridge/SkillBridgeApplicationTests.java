package com.skillbridge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class SkillBridgeApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring application context boots with all beans, security filter chain, and JPA repositories
    }
}
