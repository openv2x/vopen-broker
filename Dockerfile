FROM rabbitmq:management

# install dependencies
RUN apt-get update && \
    apt-get install -y wget && \
    wget https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_auth_backend_http-3.6.8.ez -O /tmp/auth_backend_http.ez && \
    mv /tmp/auth_backend_http.ez /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.10/plugins/


# Enable plubins
RUN rabbitmq-plugins enable --offline rabbitmq_mqtt rabbitmq_web_mqtt rabbitmq_auth_backend_http
