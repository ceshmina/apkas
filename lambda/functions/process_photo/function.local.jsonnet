{
  Environment: {
    Variables: {
      TARGET_BUCKET: 'apkas-development-photos',
    },
  },
  FunctionName: 'process-photo',
  Handler: 'functions.process_photo.main.handler',
  Role: 'arn:aws:iam::000000000000:role/lambda-execute',
  Runtime: 'python3.13',
}
