package com.canonbridge.mock.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class FastCargoService {

    @Value("${mock.fastcargo.service-url:http://localhost:8080}")
    private String serviceUrl;

    public String getTrackingResponse(String trackingNumber) {
        var now = Instant.now();
        var deliveredTime = now.minusSeconds(3600);
        
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                               xmlns:fc="http://fastcargo.com/tracking">
                    <soap:Body>
                        <fc:TrackShipmentResponse>
                            <fc:Shipment>
                                <fc:TrackingNumber>%s</fc:TrackingNumber>
                                <fc:ShipmentId>SHIP-%s</fc:ShipmentId>
                                <fc:Status>DELIVERED</fc:Status>
                                <fc:LastCheckpoint>
                                    <fc:Location>London Distribution Center</fc:Location>
                                    <fc:City>London</fc:City>
                                    <fc:Country>GB</fc:Country>
                                    <fc:Timestamp>%s</fc:Timestamp>
                                    <fc:Description>Package delivered to recipient</fc:Description>
                                </fc:LastCheckpoint>
                                <fc:DeliveredTimestamp>%s</fc:DeliveredTimestamp>
                                <fc:ReceiverCity>London</fc:ReceiverCity>
                                <fc:CarrierBranch>London Central</fc:CarrierBranch>
                                <fc:ProofOfDelivery>POD-%s</fc:ProofOfDelivery>
                                <fc:Weight>2.5</fc:Weight>
                                <fc:WeightUnit>KG</fc:WeightUnit>
                            </fc:Shipment>
                        </fc:TrackShipmentResponse>
                    </soap:Body>
                </soap:Envelope>
                """.formatted(
                        trackingNumber,
                        trackingNumber.substring(Math.max(0, trackingNumber.length() - 6)),
                        deliveredTime.toString(),
                        deliveredTime.toString(),
                        trackingNumber
                );
    }

    public String getCreateShipmentResponse(String reference) {
        var now = Instant.now();
        var trackingNumber = "FC-" + Long.toHexString(System.currentTimeMillis()).toUpperCase();

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                               xmlns:fc="http://fastcargo.com/tracking">
                    <soap:Body>
                        <fc:CreateShipmentResponse>
                            <fc:Shipment>
                                <fc:Reference>%s</fc:Reference>
                                <fc:TrackingNumber>%s</fc:TrackingNumber>
                                <fc:Status>CREATED</fc:Status>
                                <fc:CreatedAt>%s</fc:CreatedAt>
                                <fc:LabelUrl>%s/labels/%s.pdf</fc:LabelUrl>
                            </fc:Shipment>
                        </fc:CreateShipmentResponse>
                    </soap:Body>
                </soap:Envelope>
                """.formatted(reference, trackingNumber, now.toString(), serviceUrl, trackingNumber);
    }

    public String getWsdl() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
                             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
                             xmlns:tns="http://fastcargo.com/tracking"
                             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                             targetNamespace="http://fastcargo.com/tracking"
                             name="FastCargoTrackingService">
                
                    <types>
                        <xsd:schema targetNamespace="http://fastcargo.com/tracking">
                            <xsd:element name="TrackShipmentRequest">
                                <xsd:complexType>
                                    <xsd:sequence>
                                        <xsd:element name="trackingNumber" type="xsd:string"/>
                                    </xsd:sequence>
                                </xsd:complexType>
                            </xsd:element>
                            
                            <xsd:element name="TrackShipmentResponse">
                                <xsd:complexType>
                                    <xsd:sequence>
                                        <xsd:element name="Shipment" type="tns:ShipmentType"/>
                                    </xsd:sequence>
                                </xsd:complexType>
                            </xsd:element>
                            
                            <xsd:complexType name="ShipmentType">
                                <xsd:sequence>
                                    <xsd:element name="TrackingNumber" type="xsd:string"/>
                                    <xsd:element name="ShipmentId" type="xsd:string"/>
                                    <xsd:element name="Status" type="xsd:string"/>
                                    <xsd:element name="LastCheckpoint" type="tns:CheckpointType"/>
                                    <xsd:element name="DeliveredTimestamp" type="xsd:string" minOccurs="0"/>
                                    <xsd:element name="ReceiverCity" type="xsd:string"/>
                                    <xsd:element name="CarrierBranch" type="xsd:string"/>
                                    <xsd:element name="ProofOfDelivery" type="xsd:string" minOccurs="0"/>
                                    <xsd:element name="Weight" type="xsd:decimal"/>
                                    <xsd:element name="WeightUnit" type="xsd:string"/>
                                </xsd:sequence>
                            </xsd:complexType>
                            
                            <xsd:complexType name="CheckpointType">
                                <xsd:sequence>
                                    <xsd:element name="Location" type="xsd:string"/>
                                    <xsd:element name="City" type="xsd:string"/>
                                    <xsd:element name="Country" type="xsd:string"/>
                                    <xsd:element name="Timestamp" type="xsd:string"/>
                                    <xsd:element name="Description" type="xsd:string"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:schema>
                    </types>
                
                    <message name="TrackShipmentRequestMessage">
                        <part name="parameters" element="tns:TrackShipmentRequest"/>
                    </message>
                    
                    <message name="TrackShipmentResponseMessage">
                        <part name="parameters" element="tns:TrackShipmentResponse"/>
                    </message>
                
                    <portType name="TrackingPortType">
                        <operation name="TrackShipment">
                            <input message="tns:TrackShipmentRequestMessage"/>
                            <output message="tns:TrackShipmentResponseMessage"/>
                        </operation>
                    </portType>
                
                    <binding name="TrackingBinding" type="tns:TrackingPortType">
                        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
                        <operation name="TrackShipment">
                            <soap:operation soapAction="http://fastcargo.com/tracking/TrackShipment"/>
                            <input>
                                <soap:body use="literal"/>
                            </input>
                            <output>
                                <soap:body use="literal"/>
                            </output>
                        </operation>
                    </binding>
                
                    <service name="FastCargoTrackingService">
                        <documentation>FastCargo Shipment Tracking Service</documentation>
                        <port name="TrackingPort" binding="tns:TrackingBinding">
                            <soap:address location="%s/ws/track"/>
                        </port>
                    </service>
                </definitions>
                """.formatted(serviceUrl);
    }
}
