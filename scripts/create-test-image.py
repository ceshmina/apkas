#!/usr/bin/env python3
"""
Create a test JPEG image for Lambda testing
"""

from PIL import Image
import sys
import os

def create_test_image(output_path, width=100, height=100):
    """Create a simple test JPEG image"""
    # Create a simple red square image
    image = Image.new('RGB', (width, height), color='red')
    
    # Draw a simple pattern
    for x in range(0, width, 10):
        for y in range(0, height, 10):
            if (x // 10 + y // 10) % 2 == 0:
                image.putpixel((x, y), (255, 255, 255))  # White
    
    # Save as JPEG
    image.save(output_path, 'JPEG', quality=85)
    print(f"Test image created: {output_path}")

if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/test.jpg"
    create_test_image(output_path)
