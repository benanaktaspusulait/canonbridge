package com.canonbridge.outbound.service;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.InetAddress;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@ApplicationScoped
public class UrlValidationService {

    private static final Logger LOG = Logger.getLogger(UrlValidationService.class);

    @ConfigProperty(name = "outbound.allow-private-ips", defaultValue = "false")
    boolean allowPrivateIps;

    @ConfigProperty(name = "outbound.url-allowlist", defaultValue = "")
    String urlAllowlist;

    private static final List<Pattern> PRIVATE_IP_PATTERNS = Arrays.asList(
        Pattern.compile("^127\\..*"),           // Loopback
        Pattern.compile("^10\\..*"),            // Private Class A
        Pattern.compile("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*"), // Private Class B
        Pattern.compile("^192\\.168\\..*"),     // Private Class C
        Pattern.compile("^169\\.254\\..*"),     // Link-local
        Pattern.compile("^::1$"),               // IPv6 loopback
        Pattern.compile("^fe80:.*"),            // IPv6 link-local
        Pattern.compile("^fc00:.*"),            // IPv6 unique local
        Pattern.compile("^fd00:.*")             // IPv6 unique local
    );

    public Uni<Boolean> validateUrl(String url) {
        try {
            URI uri = new URI(url);
            
            // Check protocol
            if (!uri.getScheme().equals("http") && !uri.getScheme().equals("https")) {
                LOG.warnf("Invalid protocol: %s", uri.getScheme());
                return Uni.createFrom().item(false);
            }

            String host = uri.getHost();
            if (host == null || host.isEmpty()) {
                LOG.warn("Empty host");
                return Uni.createFrom().item(false);
            }

            // Check allowlist if configured
            if (urlAllowlist != null && !urlAllowlist.isEmpty()) {
                List<String> allowedDomains = Arrays.asList(urlAllowlist.split(","));
                boolean inAllowlist = allowedDomains.stream()
                    .anyMatch(domain -> host.endsWith(domain.trim()));
                
                if (!inAllowlist) {
                    LOG.warnf("Host not in allowlist: %s", host);
                    return Uni.createFrom().item(false);
                }
            }

            // Check for private IPs
            if (!allowPrivateIps) {
                return Uni.createFrom().item(() -> {
                    try {
                        InetAddress address = InetAddress.getByName(host);
                        String ip = address.getHostAddress();
                        
                        for (Pattern pattern : PRIVATE_IP_PATTERNS) {
                            if (pattern.matcher(ip).matches()) {
                                LOG.warnf("Private IP detected: %s", ip);
                                return false;
                            }
                        }
                        return true;
                    } catch (Exception e) {
                        LOG.error("Failed to resolve host", e);
                        return false;
                    }
                });
            }

            return Uni.createFrom().item(true);

        } catch (Exception e) {
            LOG.error("URL validation failed", e);
            return Uni.createFrom().item(false);
        }
    }
}
