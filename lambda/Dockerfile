# Use Amazon Linux 2023 base image for Lambda compatibility
FROM amazonlinux:2023

WORKDIR /var/task

# Install system dependencies including Python 3.11, perl, and build tools
RUN yum update -y && \
    yum install -y \
        python3.11 \
        python3.11-pip \
        zip \
        wget \
        tar \
        gzip \
        perl \
        perl-devel \
        make \
        gcc \
        gcc-c++ \
        which \
    && yum clean all

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
    which perl && \
    cp $(which perl) /var/task/bin/perl && \
    chmod +x /var/task/bin/perl && \
    ls -la /var/task/bin/ && \
    echo "Perl version:" && /var/task/bin/perl --version | head -1

# Copy Perl libraries to var/task for Lambda compatibility
RUN cp -r /var/task/lib/perl5 /var/task/ 2>/dev/null || true && \
    echo "Checking Perl library paths:" && \
    find /var/task -name "*.pm" | head -5 && \
    echo "ExifTool library check:" && \
    find /var/task -name "ExifTool.pm" && \
    echo "Perl @INC will include: /var/task/perl5 /var/task/lib/perl5"

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
