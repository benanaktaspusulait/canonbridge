package com.canonbridge.mappingstudio.xml;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

/**
 * Service for XML/JSON transformation
 */
@ApplicationScoped
public class XmlTransformService {

    private static final Logger LOG = Logger.getLogger(XmlTransformService.class);

    private final XmlMapper xmlMapper = new XmlMapper();
    private final ObjectMapper jsonMapper = new ObjectMapper();

    /**
     * Convert XML string to JSON string
     */
    public String xmlToJson(String xml) throws Exception {
        LOG.debugf("Converting XML to JSON: %d bytes", xml.length());
        
        try {
            // Parse XML to JsonNode
            JsonNode node = xmlMapper.readTree(xml);
            
            // Convert to JSON string
            String json = jsonMapper.writeValueAsString(node);
            
            LOG.debugf("Converted XML to JSON: %d bytes", json.length());
            return json;
        } catch (Exception e) {
            LOG.errorf(e, "Failed to convert XML to JSON");
            throw new XmlTransformException("Failed to convert XML to JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Convert JSON string to XML string
     */
    public String jsonToXml(String json) throws Exception {
        LOG.debugf("Converting JSON to XML: %d bytes", json.length());
        
        try {
            // Parse JSON to JsonNode
            JsonNode node = jsonMapper.readTree(json);
            
            // Convert to XML string
            String xml = xmlMapper.writeValueAsString(node);
            
            LOG.debugf("Converted JSON to XML: %d bytes", xml.length());
            return xml;
        } catch (Exception e) {
            LOG.errorf(e, "Failed to convert JSON to XML");
            throw new XmlTransformException("Failed to convert JSON to XML: " + e.getMessage(), e);
        }
    }

    /**
     * Create SOAP envelope with body content
     */
    public String createSoapEnvelope(String bodyContent, String namespace) {
        LOG.debugf("Creating SOAP envelope with namespace: %s", namespace);
        
        StringBuilder envelope = new StringBuilder();
        envelope.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        envelope.append("<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"");
        
        if (namespace != null && !namespace.isEmpty()) {
            envelope.append(" xmlns:ns=\"").append(namespace).append("\"");
        }
        
        envelope.append(">\n");
        envelope.append("  <soap:Header/>\n");
        envelope.append("  <soap:Body>\n");
        envelope.append("    ").append(bodyContent).append("\n");
        envelope.append("  </soap:Body>\n");
        envelope.append("</soap:Envelope>");
        
        return envelope.toString();
    }

    /**
     * Extract body content from SOAP envelope
     */
    public String extractSoapBody(String soapEnvelope) throws Exception {
        LOG.debug("Extracting body from SOAP envelope");
        
        try {
            // Simple extraction using string manipulation
            // For production, consider using a proper SOAP library
            int bodyStart = soapEnvelope.indexOf("<soap:Body>");
            int bodyEnd = soapEnvelope.indexOf("</soap:Body>");
            
            if (bodyStart == -1 || bodyEnd == -1) {
                // Try alternative namespace
                bodyStart = soapEnvelope.indexOf("<Body>");
                bodyEnd = soapEnvelope.indexOf("</Body>");
            }
            
            if (bodyStart == -1 || bodyEnd == -1) {
                throw new XmlTransformException("SOAP Body not found in envelope");
            }
            
            // Extract content between Body tags
            String bodyTag = soapEnvelope.substring(bodyStart, soapEnvelope.indexOf(">", bodyStart) + 1);
            String body = soapEnvelope.substring(bodyStart + bodyTag.length(), bodyEnd).trim();
            
            LOG.debugf("Extracted SOAP body: %d bytes", body.length());
            return body;
        } catch (Exception e) {
            LOG.errorf(e, "Failed to extract SOAP body");
            throw new XmlTransformException("Failed to extract SOAP body: " + e.getMessage(), e);
        }
    }

    /**
     * Validate XML structure
     */
    public boolean isValidXml(String xml) {
        try {
            xmlMapper.readTree(xml);
            return true;
        } catch (Exception e) {
            LOG.debugf("Invalid XML: %s", e.getMessage());
            return false;
        }
    }

    /**
     * Pretty print XML
     */
    public String prettyPrintXml(String xml) throws Exception {
        try {
            JsonNode node = xmlMapper.readTree(xml);
            return xmlMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to pretty print XML");
            throw new XmlTransformException("Failed to pretty print XML: " + e.getMessage(), e);
        }
    }

    /**
     * Custom exception for XML transformation errors
     */
    public static class XmlTransformException extends Exception {
        public XmlTransformException(String message) {
            super(message);
        }

        public XmlTransformException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
