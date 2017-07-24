FROM rabbitmq:latest

# ----------------------
# install dependencies
# ----------------------
RUN apt-get update && \
    apt-get install -y wget && \
    wget https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_auth_backend_http-3.6.8.ez -O /tmp/auth_backend_http.ez && \
    mv /tmp/auth_backend_http.ez /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.10/plugins/

# ----------------------
# add config file
# ----------------------
COPY ["./rabbitmq.config", "/etc/rabbitmq/rabbitmq.config"]

# ----------------------
# enable plubins
# ----------------------
# RUN rabbitmq-plugins enable --offline rabbitmq_management
RUN rabbitmq-plugins enable --offline rabbitmq_mqtt
RUN rabbitmq-plugins enable --offline rabbitmq_web_mqtt
RUN rabbitmq-plugins enable --offline rabbitmq_auth_backend_http
