#!/bin/bash

# Build Lambda layer with exiftool
echo "Building Lambda layer with exiftool..."

# Create layer directory
mkdir -p lambda/layer/build

# Build the layer using Docker
docker build -t lambda-exiftool-layer lambda/layer/

# Create a container and copy the layer files
docker create --name temp-layer lambda-exiftool-layer
docker cp temp-layer:/opt lambda/layer/build/
docker rm temp-layer

# Create zip file for the layer
cd lambda/layer/build
zip -r ../exiftool-layer.zip ./*
cd ../../../

echo "Lambda layer built successfully at lambda/layer/exiftool-layer.zip"
