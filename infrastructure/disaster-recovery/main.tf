resource "aws_s3_bucket" "primary" {
  bucket = var.primary_bucket
  versioning {
    enabled = true
  }
}

provider "aws" {
  alias  = "replica"
  region = var.replica_region
}

resource "aws_s3_bucket" "replica" {
  provider = aws.replica
  bucket   = var.replica_bucket
  versioning {
    enabled = true
  }
}

resource "aws_iam_role" "replication" {
  name               = "${var.primary_bucket}-replication"
  assume_role_policy = data.aws_iam_policy_document.replication_assume.json
}

data "aws_iam_policy_document" "replication_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "replication" {
  name   = "replication"
  role   = aws_iam_role.replication.id
  policy = data.aws_iam_policy_document.replication.json
}

data "aws_iam_policy_document" "replication" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:ReplicateObject",
      "s3:ReplicateDelete",
      "s3:ReplicateTags",
      "s3:GetReplicationConfiguration"
    ]
    resources = [
      aws_s3_bucket.primary.arn,
      "${aws_s3_bucket.primary.arn}/*",
      aws_s3_bucket.replica.arn,
      "${aws_s3_bucket.replica.arn}/*"
    ]
  }
}

resource "aws_s3_bucket_replication_configuration" "replication" {
  bucket = aws_s3_bucket.primary.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "dr"
    status = "Enabled"
    destination {
      bucket        = aws_s3_bucket.replica.arn
      storage_class = "STANDARD"
    }
  }
}
