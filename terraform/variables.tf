variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "conectarena"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "backend_port" {
  description = "Backend API port"
  type        = number
  default     = 8080
}

variable "frontend_port" {
  description = "Frontend port"
  type        = number
  default     = 80
}

# Backend container settings
variable "backend_cpu" {
  description = "CPU units for backend container (256, 512, 1024, etc)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory in MB for backend container"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend instances"
  type        = number
  default     = 2
}

# Frontend container settings
variable "frontend_cpu" {
  description = "CPU units for frontend container"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory in MB for frontend container"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend instances"
  type        = number
  default     = 2
}

# RDS settings
variable "db_engine_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16.1"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "conectarena"
}

# Container registry settings
variable "ecr_image_scan_on_push" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "container_image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}
