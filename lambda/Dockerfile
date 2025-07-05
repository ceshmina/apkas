FROM python:3.9-slim

WORKDIR /var/task

# Install system dependencies
RUN apt-get update && apt-get install -y zip && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt -t .

# Copy source code
COPY photo_resizer.py .

# Create output directory
RUN mkdir -p /output

# Create build script
RUN echo '#!/bin/bash\ncd /var/task\nzip -r /output/lambda.zip .' > /build.sh && chmod +x /build.sh

CMD ["/build.sh"]
