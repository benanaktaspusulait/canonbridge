package com.canonbridge.mappingstudio.config;

import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.mutiny.core.Vertx as MutinyVertx;
import io.vertx.mutiny.ext.web.client.WebClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;

@ApplicationScoped
public class WebClientProducer {

    @Inject
    Vertx vertx;

    @Produces
    @ApplicationScoped
    public WebClient webClient() {
        var options = new WebClientOptions()
            .setConnectTimeout(10000)
            .setIdleTimeout(30000)
            .setFollowRedirects(true)
            .setMaxRedirects(5);
        
        return WebClient.create(MutinyVertx.newInstance(vertx), options);
    }
}
