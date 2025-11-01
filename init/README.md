#######################################
# INSTALL KIND (Kubernetes IN Docker)
#######################################

# Clone the official Kind repository
git clone https://github.com/kubernetes-sigs/kind.git

# Go inside the project directory
cd kind

# Build Kind binary using Makefile (requires Go)
make build

# Check if Kind is correctly built and available
which kind
kind version


#######################################
# INSTALL DOCKER (required for Kind & Minikube)
#######################################

# Update package list
sudo apt-get update -y

# Install Docker Engine
sudo apt install docker.io -y

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
sudo docker run hello-world


#######################################
# INSTALL MINIKUBE (Local Kubernetes using VM or Docker)
#######################################

# Download the latest Minikube binary
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Move binary to your system path
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version

# Start Minikube cluster (using Docker as the driver)
minikube start --driver=docker

# Verify cluster and nodes
kubectl get nodes


#######################################
# OPTIONAL: TEST BOTH CLUSTERS
#######################################

# Check all Kind clusters
kind get clusters

# Check current context (should show either minikube or kind)
kubectl config get-contexts

# Switch context if needed
# kubectl config use-context kind-first-cluster
# kubectl config use-context minikube
