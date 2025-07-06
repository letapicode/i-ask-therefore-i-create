output "user_pool_id" {
  value       = aws_cognito_user_pool.this.id
  description = "ID of the user pool"
}

output "client_id" {
  value       = aws_cognito_user_pool_client.client.id
  description = "ID of the app client"
}
