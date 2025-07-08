output "kube_config" {
  description = "Kubeconfig of the cluster"
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
}
