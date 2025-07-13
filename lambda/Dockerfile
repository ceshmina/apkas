# Use Amazon Linux 2023 base image for Lambda compatibility
FROM amazonlinux:2023

WORKDIR /var/task

# Install only required system dependencies for Python
RUN yum update -y && \
    yum install -y \
        python3.11 \
        python3.11-pip \
        zip \
    && yum clean all

# Install Python dependencies
COPY requirements.txt .
RUN python3.11 -m pip install --upgrade pip && \
    python3.11 -m pip install -r requirements.txt -t .

# Copy source code
COPY photo_resizer.py .

# Create output directory
RUN mkdir -p /output

# Create build script
RUN echo '#!/bin/bash\ncd /var/task\nzip -r /output/lambda.zip .' > /build.sh && chmod +x /build.sh

CMD ["/build.sh"]
