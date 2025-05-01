provider "aws" {
  region = "us-east-1"
}

# Zip the lambda_function.py
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda_function.zip"
}

# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda-basic-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWSLambdaBasicExecutionRole to allow CloudWatch logging
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function Resource
resource "aws_lambda_function" "my_lambda" {
  function_name = "MyLambdaFunction"
  filename      = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler       = "lambda_function.lambda_handler" # filename.function
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec_role.arn
  timeout       = 30
  
 environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.converted_code_bucket.bucket
    }
  }
}


## Add Permission for using bedrock
resource "aws_iam_role_policy" "bedrock_invoke" {
  name = "allow-bedrock-invoke"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "bedrock:InvokeModel",
        Resource = "arn:aws:bedrock:us-east-1::foundation-model/*"
      }
    ]
  })
}

## Add S3 bucket 
resource "aws_s3_bucket" "converted_code_bucket" {
  bucket = "lambda-code-output-${random_id.suffix.hex}"
  force_destroy = true
}

resource "random_id" "suffix" {
  byte_length = 4
}
## Add IAM Permission to Lambda Role 
resource "aws_iam_role_policy" "lambda_s3_write" {
  name = "allow-s3-write"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject"
        ],
        Resource = "${aws_s3_bucket.converted_code_bucket.arn}/*"
      }
    ]
  })
}

output "s3_bucket_name" {
  value = aws_s3_bucket.converted_code_bucket.bucket
}
