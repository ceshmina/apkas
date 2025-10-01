{
  Environment: {
    Variables: {
      TARGET_BUCKET: "{{ must_env `TARGET_BUCKET` }}",
    },
  },
  FunctionName: 'process-photo',
  Handler: 'functions.process_photo.main.handler',
  MemorySize: 1024,
  Role: "{{ tfstate `module.apkas.aws_iam_role.lambda_execute.arn` }}",
  Runtime: 'python3.13',
  Timeout: 60,
}
