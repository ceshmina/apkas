import json
import boto3
import os
from urllib.parse import unquote_plus
from PIL import Image
import io
import uuid
from datetime import datetime, timezone

# Pillow is already imported above

def extract_exif_with_pillow(image_data):
    """
    Extract EXIF data from image using Pillow
    
    Args:
        image_data: Binary image data
        
    Returns:
        tuple: (exif_data dict, date_taken string or None, debug_info dict)
    """
    exif_data = {}
    date_taken = None
    debug_info = {}
    
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS, GPSTAGS
        
        # Open image from binary data
        with Image.open(io.BytesIO(image_data)) as img:
            debug_info['image_format'] = img.format
            debug_info['image_mode'] = img.mode
            debug_info['image_size'] = img.size
            
            # Get EXIF data
            exif_dict = img.getexif()
            debug_info['raw_exif_keys_count'] = len(exif_dict) if exif_dict else 0
            
            if exif_dict:
                # Convert numeric tags to human-readable names
                for tag_id, value in exif_dict.items():
                    tag_name = TAGS.get(tag_id, tag_id)
                    
                    # Handle different value types
                    if isinstance(value, bytes):
                        try:
                            value = value.decode('utf-8', errors='ignore')
                        except:
                            value = str(value)
                    elif isinstance(value, (tuple, list)) and len(value) > 0:
                        # Handle rational numbers and coordinates
                        if all(isinstance(x, (int, float)) for x in value):
                            if len(value) == 2 and value[1] != 0:
                                # Rational number (numerator/denominator)
                                value = f"{value[0]}/{value[1]}"
                            else:
                                value = str(value)
                        else:
                            value = str(value)
                    
                    exif_data[str(tag_name)] = str(value)
                    
                    # Look for date fields
                    if tag_name in ['DateTime', 'DateTimeOriginal', 'DateTimeDigitized']:
                        try:
                            date_str = str(value)
                            if ':' in date_str and len(date_str) >= 19:
                                # Format: "2023:12:25 14:30:45"
                                date_taken = datetime.strptime(date_str[:19], '%Y:%m:%d %H:%M:%S').isoformat()
                                debug_info['date_taken_source'] = tag_name
                                print(f"Found date from {tag_name}: {date_taken}")
                                break  # Use the first valid date found
                        except ValueError as e:
                            print(f"Failed to parse date from {tag_name}: {value} - {e}")
                            continue
                
                # Handle GPS data if present
                gps_info = exif_dict.get_ifd(0x8825)  # GPS IFD
                if gps_info:
                    gps_data = {}
                    for gps_tag_id, gps_value in gps_info.items():
                        gps_tag_name = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        if isinstance(gps_value, bytes):
                            try:
                                gps_value = gps_value.decode('utf-8', errors='ignore')
                            except:
                                gps_value = str(gps_value)
                        gps_data[str(gps_tag_name)] = str(gps_value)
                    
                    if gps_data:
                        exif_data['GPS'] = gps_data
                        debug_info['gps_fields_count'] = len(gps_data)
                
                debug_info['extracted_fields_count'] = len(exif_data)
                print(f"Extracted {len(exif_data)} EXIF fields using Pillow")
            else:
                debug_info['error'] = 'No EXIF data found in image'
                print("No EXIF data found in image")
        
    except Exception as e:
        debug_info['error'] = f'Exception in Pillow EXIF extraction: {str(e)}'
        print(f"Error extracting EXIF with Pillow: {str(e)}")
    
    debug_info['method'] = 'pillow'
    return exif_data, date_taken, debug_info

def lambda_handler(event, context):
    """
    Lambda function to resize photos uploaded to S3
    
    Args:
        event: S3 event data
        context: Lambda context
    
    Returns:
        dict: Response with status code and message
    """
    
    # Initialize S3 client for LocalStack
    s3_client = boto3.client('s3')
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ.get('DYNAMODB_TABLE')
    table = dynamodb.Table(table_name)
    
    # Get destination bucket from environment variable
    destination_bucket = os.environ.get('DESTINATION_BUCKET')
    
    try:
        # Process each record in the event
        for record in event['Records']:
            # Get source bucket and key from the event
            source_bucket = record['s3']['bucket']['name']
            source_key = unquote_plus(record['s3']['object']['key'])
            
            print(f"Processing file: {source_key} from bucket: {source_bucket}")
            
            # Skip if not an image file (only jpg/jpeg)
            if not source_key.lower().endswith(('.jpg', '.jpeg')):
                print(f"Skipping non-image file: {source_key}")
                continue
            
            # Parse the file path to generate destination keys
            # abc/test.jpg -> abc/test/large.webp, abc/test/medium.webp, abc/test/thumbnail.webp
            file_path_parts = source_key.rsplit('.', 1)
            base_path = file_path_parts[0]  # abc/test
            
            # Get the image from S3
            print(f"Downloading image from S3: {source_key}")
            response = s3_client.get_object(Bucket=source_bucket, Key=source_key)
            image_data = response['Body'].read()
            
            # Extract EXIF data using Pillow
            print(f"=== EXIF EXTRACTION START ===")
            try:
                exif_data, date_taken, debug_info = extract_exif_with_pillow(image_data)
                print(f"Extracted {len(exif_data)} EXIF fields")
                if date_taken:
                    print(f"Found date_taken: {date_taken}")
                print(f"=== EXIF EXTRACTION END ===")
            except Exception as e:
                print(f"ERROR in EXIF extraction: {str(e)}")
                exif_data = {}
                date_taken = None
                debug_info = {'error': f'EXIF extraction failed: {str(e)}', 'method': 'pillow'}
                # Continue processing even if EXIF extraction fails
            
            # Open and process the image
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert to RGB if necessary (for JPEG compatibility)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                original_width, original_height = img.size
                
                # Define resize configurations: (size_name, max_long_edge, quality)
                sizes = [
                    ('large', 3840, 90),
                    ('medium', 1920, 85), 
                    ('thumbnail', 240, 80)
                ]
                
                processed_files = []
                
                for size_name, max_long_edge, quality in sizes:
                    # Calculate dimensions to fit within max_long_edge on the longest side
                    width, height = original_width, original_height
                    
                    if width > height:
                        if width > max_long_edge:
                            new_width = max_long_edge
                            new_height = int((height * max_long_edge) / width)
                        else:
                            new_width, new_height = width, height
                    else:
                        if height > max_long_edge:
                            new_height = max_long_edge
                            new_width = int((width * max_long_edge) / height)
                        else:
                            new_width, new_height = width, height
                    
                    # Create resized image (always create all sizes, even if smaller than target)
                    if new_width != width or new_height != height:
                        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    else:
                        resized_img = img.copy()
                    
                    # Save as WebP
                    output_buffer = io.BytesIO()
                    resized_img.save(output_buffer, format='WebP', quality=quality)
                    output_buffer.seek(0)
                    
                    # Generate destination key
                    destination_key = f"{base_path}/{size_name}.webp"
                    
                    # Upload resized image to destination bucket
                    s3_client.put_object(
                        Bucket=destination_bucket,
                        Key=destination_key,
                        Body=output_buffer.getvalue(),
                        ContentType='image/webp'
                    )
                    
                    processed_files.append(f"{destination_key} ({new_width}x{new_height})")
            
            print(f"Successfully processed {source_key} -> {', '.join(processed_files)}")
            
            # Save metadata to DynamoDB
            photo_id = str(uuid.uuid4())
            created_at = datetime.now(timezone.utc).isoformat()
            
            metadata = {
                'photo_id': photo_id,
                'created_at': created_at,
                'original_bucket': source_bucket,
                'original_key': source_key,
                'destination_bucket': destination_bucket,
                'processed_files': processed_files,
                'original_dimensions': {
                    'width': original_width,
                    'height': original_height
                },
                'file_size': len(image_data),
                'content_type': 'image/jpeg',
                'exif_data': exif_data,
                'date_taken': date_taken,
                'debug_info': debug_info if 'debug_info' in locals() else {}
            }
            
            # Write to DynamoDB
            table.put_item(Item=metadata)
            print(f"Saved metadata to DynamoDB: photo_id={photo_id}")
        
        return {
            'statusCode': 200,
            'body': json.dumps('Successfully processed all files')
        }
        
    except Exception as e:
        print(f"Error processing files: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error processing files: {str(e)}')
        }
