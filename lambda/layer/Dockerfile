FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies
RUN yum update -y && \
    yum install -y wget tar gzip perl perl-ExtUtils-MakeMaker make

# Install exiftool
RUN cd /tmp && \
    wget https://exiftool.org/Image-ExifTool-12.97.tar.gz && \
    tar -xzf Image-ExifTool-12.97.tar.gz && \
    cd Image-ExifTool-12.97 && \
    perl Makefile.PL && \
    make && \
    make install

# Install pyexiftool
RUN pip install pyexiftool

# Create layer structure
RUN mkdir -p /opt/bin /opt/python

# Copy exiftool binary to layer
RUN cp /usr/local/bin/exiftool /opt/bin/exiftool

# Install Python packages to layer
RUN pip install pyexiftool -t /opt/python

# Set permissions
RUN chmod +x /opt/bin/exiftool
