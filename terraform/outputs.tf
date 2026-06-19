# Terraform outputs

output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Application Load Balancer DNS name"
}

output "backend_ecr_repository_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "Backend ECR repository URL"
}

output "frontend_ecr_repository_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "Frontend ECR repository URL"
}

output "db_address" {
  value       = aws_db_instance.main.address
  description = "RDS database address"
  sensitive   = true
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "backend_service_name" {
  value       = aws_ecs_service.backend.name
  description = "Backend ECS service name"
}

output "frontend_service_name" {
  value       = aws_ecs_service.frontend.name
  description = "Frontend ECS service name"
}

output "cloudwatch_log_group" {
  value       = aws_cloudwatch_log_group.ecs.name
  description = "CloudWatch log group name"
}
