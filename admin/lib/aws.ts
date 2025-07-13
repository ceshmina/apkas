import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// LocalStack configuration
const isLocalStack = process.env.NODE_ENV === 'development';

const awsConfig = {
  region: 'ap-northeast-1',
  ...(isLocalStack && {
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  }),
};

export const s3Client = new S3Client(awsConfig);
export const dynamoDBClient = new DynamoDBClient(awsConfig);

// Bucket names (should match Terraform configuration)
export const BUCKETS = {
  originalPhotos: 'apkas-dev-original-photos',
  resizedPhotos: 'apkas-dev-resized-photos',
};

// DynamoDB table name
export const DYNAMODB_TABLE = 'apkas-dev-photo-metadata';