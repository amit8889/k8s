# Kubernetes Kind Cluster Setup

## Create Cluster

Create a new Kind cluster with the following command:
```bash
kind create cluster --config config.yaml --image kindest/node:v1.30.0 --retain
```

## Verify Cluster Setup

Once the setup is complete, run the following commands to verify your cluster:

### List all clusters
```bash
kind get clusters
```

This will display all available Kind clusters on your system.

### Switch to your cluster

Switch to the cluster using the name you specified in your YAML configuration file.

### Get cluster information

Use the following command to get detailed information about your cluster:
```bash
kubectl config use-contex --context kind-my-learning-cluster
kubectl cluster-info --context kind-my-learning-cluster
```

### View cluster nodes

Check all nodes in your cluster:
```bash
kubectl get nodes
```

This will display all nodes: 1 control plane node and 3 worker nodes, as defined in your YAML configuration.

## Notes

- Make sure you have Kind and kubectl installed before running these commands
- Replace `my-learning-cluster` with your actual cluster name from the config.yaml file
- The `--retain` flag keeps the cluster even if creation fails, useful for debugging