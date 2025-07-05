import json
import boto3
import os
from urllib.parse import unquote_plus
from PIL import Image
import io

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
