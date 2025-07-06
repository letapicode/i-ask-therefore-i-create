# SES Module

Configures Amazon SES for sending notification emails including a default template.

## Usage
```hcl
module "ses" {
  source          = "./infrastructure/ses"
  domain          = "example.com"
  template_name   = "build"
  template_subject = "Build Notification"
}
```

Initialize with `terraform init` and format with `terraform fmt`.
