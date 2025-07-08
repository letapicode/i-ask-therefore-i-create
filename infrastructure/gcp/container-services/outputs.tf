output "cluster_endpoint" {
  description = "Endpoint of the cluster"
  value       = google_container_cluster.cluster.endpoint
}
