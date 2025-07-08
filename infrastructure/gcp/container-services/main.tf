resource "google_container_cluster" "cluster" {
  name               = var.cluster_name
  location           = var.region
  initial_node_count = var.initial_node_count
}
