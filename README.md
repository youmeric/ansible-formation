# Projet Terraform – Docker Container

Ce projet utilise Terraform pour déployer un conteneur Docker.

## Installation de Terraform

Voici les commandes utilisées pour installer Terraform sur Linux :

```bash
sudo apt-get update
sudo apt-get install -y wget unzip
wget https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip
unzip terraform_1.6.6_linux_amd64.zip
sudo mv terraform /usr/local/bin/
terraform -version
```

## Fichiers principaux
- `main.tf` : configuration Terraform pour le conteneur Docker
- `terraform.tfstate` et `terraform.tfstate.backup` : fichiers d’état générés par Terraform

## Étapes réalisées
1. Initialisation du projet Terraform
2. Configuration du provider Docker
3. Déploiement d’un conteneur Docker via Terraform

## Utilisation

Initialiser le projet :
```bash
terraform init
```

Appliquer la configuration :
```bash
terraform apply
```
