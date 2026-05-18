package com.canonbridge.mappingstudio.config;

import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.mutiny.ext.web.client.WebClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class WebClientProducer {

    @Inject
    Vertx vertx;

    @ConfigProperty(name = "canonbridge.http-client.max-connections-per-host", defaultValue = "50")
    int maxConnectionsPerHost;

    @Produces
    @ApplicationScoped
    public WebClient webClient() {
        var options = new WebClientOptions()
            .setConnectTimeout(10000)
            .setIdleTimeout(30000)
            .setFollowRedirects(true)
            .setMaxRedirects(5)
            .setMaxPoolSize(maxConnectionsPerHost);
        
        return WebClient.create(io.vertx.mutiny.core.Vertx.newInstance(vertx), options);
    }
}
