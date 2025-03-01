# Azure Container App Deployment Script for Life Manager

# Variables
$RESOURCE_GROUP="life-manager-rg"
$LOCATION="eastus"
$CONTAINERAPPS_ENVIRONMENT="life-manager-env"
$CONTAINERAPPS_APP="life-manager-app"
$IMAGE_NAME="life-manager"
$IMAGE_TAG="latest"
$ACR_NAME="lifemanageracr"  # Azure Container Registry name
$SUBSCRIPTION_ID="your-subscription-id"  # Replace with your subscription ID




# Build and push the Docker image to ACR
Write-Host "Building and pushing Docker image to ACR..."
az acr build --registry $ACR_NAME --image $IMAGE_NAME:$IMAGE_TAG --file Dockerfile .


