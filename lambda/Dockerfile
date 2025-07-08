FROM python:3.11-slim

WORKDIR /var/task

# Install system dependencies including wget, tar, gzip, perl, make for building exiftool
RUN apt-get update && apt-get install -y \
    zip \
    wget \
    tar \
    gzip \
    perl \
    make \
    build-essential \
    libperl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install exiftool - use a more compatible approach
RUN cd /tmp && \
    wget https://exiftool.org/Image-ExifTool-12.97.tar.gz && \
    tar -xzf Image-ExifTool-12.97.tar.gz && \
    cd Image-ExifTool-12.97 && \
    perl Makefile.PL INSTALL_BASE=/var/task && \
    make && \
    make install

# Ensure exiftool is executable and in the right location
RUN mkdir -p /var/task/bin && \
    cp /var/task/bin/exiftool /var/task/bin/exiftool-backup 2>/dev/null || true && \
    find /var/task -name "exiftool" -type f -exec cp {} /var/task/bin/exiftool \; && \
    chmod +x /var/task/bin/exiftool && \
    cp /usr/bin/perl /var/task/bin/perl && \
    chmod +x /var/task/bin/perl && \
    ls -la /var/task/bin/

# Copy Perl libraries to var/task for Lambda compatibility
RUN cp -r /var/task/lib/perl5 /var/task/ 2>/dev/null || true

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt -t .

# Copy source code
COPY photo_resizer.py .

# Create output directory
RUN mkdir -p /output

# Create build script
RUN echo '#!/bin/bash\ncd /var/task\nzip -r /output/lambda.zip .' > /build.sh && chmod +x /build.sh

CMD ["/build.sh"]
