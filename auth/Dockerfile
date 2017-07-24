FROM node:6

# ----------------------
# create application structure
# ----------------------
RUN mkdir -p /usr/app

# ----------------------
# install dependencies
# and create caching layer
# ----------------------
COPY ["package.json", "/usr/app/"]
RUN cd /usr/app && npm install -g nodemon && npm install

# ----------------------
# add application files
# ----------------------
COPY ["./app.js", "/usr/app/"]

# ----------------------
# create entry point
# ----------------------
EXPOSE 3000
WORKDIR /usr/app
CMD ["nodemon", "./bin/www"]
