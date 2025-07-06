resource "aws_ses_domain_identity" "domain" {
  domain = var.domain
}

resource "aws_ses_email_identity" "notifications" {
  email = "no-reply@${var.domain}"
}

resource "aws_ses_template" "default" {
  name       = var.template_name
  html       = var.template_html
  subject    = var.template_subject
  text       = var.template_text
}
