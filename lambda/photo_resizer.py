import json
import boto3
import os
from urllib.parse import unquote_plus

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
            
            # TODO: Implement image resizing logic here
            # For now, we'll just copy the file to demonstrate the flow
            
            # Generate destination key (e.g., add "resized_" prefix)
            destination_key = f"resized_{source_key}"
            
            # Copy the file to the destination bucket
            # In a real implementation, you would resize the image here
            s3_client.copy_object(
                CopySource={'Bucket': source_bucket, 'Key': source_key},
                Bucket=destination_bucket,
                Key=destination_key
            )
            
            print(f"Successfully processed {source_key} -> {destination_key}")
        
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
