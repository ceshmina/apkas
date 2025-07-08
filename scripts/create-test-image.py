#!/usr/bin/env python3
"""
Create a test JPEG image with EXIF data for Lambda testing
"""

from PIL import Image
from PIL.ExifTags import TAGS
import sys
import os
from datetime import datetime

def create_test_image(output_path, width=100, height=100):
    """Create a simple test JPEG image with EXIF data"""
    # Create a simple red square image
    image = Image.new('RGB', (width, height), color='red')
    
    # Draw a simple pattern
    for x in range(0, width, 10):
        for y in range(0, height, 10):
            if (x // 10 + y // 10) % 2 == 0:
                image.putpixel((x, y), (255, 255, 255))  # White
    
    # Create EXIF data
    exif_dict = {
        "0th": {
            256: width,  # ImageWidth
            257: height,  # ImageLength
            272: "Test Camera",  # Make
            306: "2023:12:25 10:30:00",  # DateTime
        },
        "Exif": {
            36867: "2023:12:25 10:30:00",  # DateTimeOriginal
            36868: "2023:12:25 10:30:00",  # DateTimeDigitized
            34665: 164,  # ExifOffset
        }
    }
    
    try:
        from PIL.ExifTags import TAGS
        import piexif
        
        # Convert to piexif format and create EXIF bytes
        exif_bytes = piexif.dump(exif_dict)
        
        # Save as JPEG with EXIF data
        image.save(output_path, 'JPEG', quality=85, exif=exif_bytes)
        print(f"Test image with EXIF created: {output_path}")
    except ImportError:
        # Fallback: save without EXIF if piexif not available
        image.save(output_path, 'JPEG', quality=85)
        print(f"Test image created (no EXIF): {output_path}")

if __name__ == "__main__":
    output_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/test.jpg"
    create_test_image(output_path)
