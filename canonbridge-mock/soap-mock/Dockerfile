FROM wiremock/wiremock:3.9.1

COPY mappings /home/wiremock/mappings
COPY wsdl /home/wiremock/__files/wsdl

CMD ["--global-response-templating", "--verbose"]

