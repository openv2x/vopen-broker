FROM rabbitmq:management

# install dependencies
RUN apt-get update && \
    apt-get install -y wget && \
    cd /tmp && \
    wget https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_auth_backend_http-3.6.8.ez -O auth_backend_http.ez

RUN wget https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_auth_backend_http-3.6.8.ez

# Enable plubins
RUN rabbitmq-plugins enable --offline rabbitmq_mqtt
RUN rabbitmq-plugins enable --offline rabbitmq_web_mqtt
