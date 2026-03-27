package com.dump.mediaservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic mediaUploadedTopic() {
        return new NewTopic("media.uploaded", 1, (short) 1);
    }
}
