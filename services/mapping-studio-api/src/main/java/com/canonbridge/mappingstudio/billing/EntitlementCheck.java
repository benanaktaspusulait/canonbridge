package com.canonbridge.mappingstudio.billing;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark JAX-RS resource methods that require entitlement checking.
 * The EntitlementInterceptor reads this annotation to determine which metric
 * and quantity to check before allowing the request.
 *
 * Usage:
 * <pre>
 * {@code @EntitlementCheck(metric = "mapping_runs", qty = 1)}
 * public Uni<Response> executeMappingRun(...) { ... }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface EntitlementCheck {

    /**
     * The metric/feature key to check (e.g., "mapping_runs", "transform_requests").
     */
    String metric();

    /**
     * The quantity to consume. Defaults to 1.
     */
    int qty() default 1;
}
