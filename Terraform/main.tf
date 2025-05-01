provider "aws" {
  region = "us-east-1"
}

# Zip the lambda_function.py
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda_function.zip"
}

resource "random_id" "suffix" {
  byte_length = 4
}

# VPC Setup
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "lambda_sg" {
  name        = "lambda-sg"
  description = "Allow Lambda access"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# DynamoDB Table
resource "aws_dynamodb_table" "lambda_logs" {
  name           = "lambda-logs"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LogID"

  attribute {
    name = "LogID"
    type = "S"
  }

  tags = {
    Name = "LambdaLogsTable"
  }
}

# EC2 as Bastion Host in public subnet using existing key
resource "aws_instance" "bastion" {
  ami                         = "ami-0c02fb55956c7d316" # Amazon Linux 2 AMI in us-east-1
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.lambda_sg.id]
  associate_public_ip_address = true
  key_name                    = "bastion-key" # Replace with your existing key name

  tags = {
    Name = "bastion-host"
  }
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

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "my_lambda" {
  function_name = "MyLambdaFunction"
  filename      = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec_role.arn
  timeout       = 30

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.converted_code_bucket.bucket
      DYNAMODB_TABLE = aws_dynamodb_table.lambda_logs.name
    }
  }
  # Removed vpc_config block to allow public internet access for DynamoDB
}

resource "aws_iam_role_policy" "bedrock_invoke" {
  name = "allow-bedrock-invoke"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["bedrock:InvokeModel"],
        Resource = "arn:aws:bedrock:us-east-1::foundation-model/*"
      },
      {
        Effect = "Allow",
        Action = ["dynamodb:PutItem"],
        Resource = aws_dynamodb_table.lambda_logs.arn
      }
    ]
  })
}

resource "aws_s3_bucket" "converted_code_bucket" {
  bucket = "lambda-code-output-${random_id.suffix.hex}"
  force_destroy = true
}

resource "aws_iam_role_policy" "lambda_s3_write" {
  name = "allow-s3-write"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["s3:PutObject"],
        Resource = "${aws_s3_bucket.converted_code_bucket.arn}/*"
      }
    ]
  })
}

output "s3_bucket_name" {
  value = aws_s3_bucket.converted_code_bucket.bucket
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.lambda_logs.name
}

output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
}
