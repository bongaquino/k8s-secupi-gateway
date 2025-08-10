output "table_name" {
  description = "The name of the DynamoDB table."
  value       = aws_dynamodb_table.main.name
}

output "table_arn" {
  description = "The ARN of the DynamoDB table."
  value       = aws_dynamodb_table.main.arn
}

output "table_id" {
  description = "The ID of the DynamoDB table."
  value       = aws_dynamodb_table.main.id
}

output "table_stream_arn" {
  description = "The ARN of the DynamoDB table stream."
  value       = aws_dynamodb_table.main.stream_arn
} 