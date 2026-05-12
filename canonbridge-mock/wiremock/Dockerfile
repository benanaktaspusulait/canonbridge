FROM wiremock/wiremock:3.9.1

COPY mappings /home/wiremock/mappings
COPY __files /home/wiremock/__files

CMD ["--global-response-templating", "--verbose"]

