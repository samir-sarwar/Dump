package com.dump.authservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic userRegisteredTopic() {
        return new NewTopic("user.registered", 1, (short) 1);
    }

    @Bean
    public NewTopic userFollowedTopic() {
        return new NewTopic("user.followed", 1, (short) 1);
    }

    @Bean
    public NewTopic userUnfollowedTopic() {
        return new NewTopic("user.unfollowed", 1, (short) 1);
    }
}
