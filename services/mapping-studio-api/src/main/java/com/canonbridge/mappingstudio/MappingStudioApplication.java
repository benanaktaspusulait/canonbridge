package com.canonbridge.mappingstudio;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;
import org.jboss.logging.Logger;

@QuarkusMain
public class MappingStudioApplication implements QuarkusApplication {

    private static final Logger LOG = Logger.getLogger(MappingStudioApplication.class);

    public static void main(String... args) {
        Quarkus.run(MappingStudioApplication.class, args);
    }

    @Override
    public int run(String... args) {
        LOG.info("Mapping Studio API started successfully");
        Quarkus.waitForExit();
        return 0;
    }
}
