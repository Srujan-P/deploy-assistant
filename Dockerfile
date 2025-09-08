# Author  : Srujan Patil <patilsru@msu.edu>
# Access instance using `docker exec -it deploy-assistant bash`

# Instantiate Ubuntu 20.04
FROM ubuntu:20.04
LABEL maintainer "Srujan Patil <patilsru@msu.edu>"
LABEL description="This is custom Docker Image for Srujan's Web Application"

# Update Ubuntu Software repository and fix package issues
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y --fix-missing python3-pip vim
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Add the Flask application and install requirements
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Open ports, set environment variables, start gunicorn.
EXPOSE 8080 
ENV PORT 8080
ENV FLASK_ENV=production  
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
# ----------------------------------------------------- 