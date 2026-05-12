package com.canonbridge.mock.config;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@RequiredArgsConstructor
public class KafkaTopicConfiguration {

    private final MockConfiguration mockConfig;

    @Bean
    public NewTopic payflexRawTopic() {
        return TopicBuilder.name(mockConfig.getKafka().getTopics().getPayflexRaw())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic shopmaxRawTopic() {
        return TopicBuilder.name(mockConfig.getKafka().getTopics().getShopmaxRaw())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic cargoUpdatesTopic() {
        return TopicBuilder.name(mockConfig.getKafka().getTopics().getCargoUpdates())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic retryDemoTopic() {
        return TopicBuilder.name(mockConfig.getKafka().getTopics().getRetryDemo())
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic dlqDemoTopic() {
        return TopicBuilder.name(mockConfig.getKafka().getTopics().getDlqDemo())
                .partitions(1)
                .replicas(1)
                .build();
    }
}
