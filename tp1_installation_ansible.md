# TP1 - Installation et Premiers Pas avec Ansible
## Formation Ansible/Terraform - Jour 1 Après-midi (13h30-15h30)

> **Objectif** : Installer Ansible, configurer un environnement de test avec Docker, et réaliser nos premières commandes automatisées.

---

## 📋 Pré-requis

- Ordinateur avec Docker installé
- Terminal/Command Prompt
- Éditeur de texte (VS Code recommandé)
- Connexion Internet

---

## 🎯 Objectifs du TP

À la fin de ce TP, vous saurez :
- ✅ Installer et configurer Ansible
- ✅ Créer un environnement de test avec Docker
- ✅ Comprendre la structure des fichiers Ansible
- ✅ Exécuter vos premières commandes ad-hoc
- ✅ Diagnostiquer les problèmes de connectivité

---

## 📁 Structure de notre projet

Créons d'abord l'arborescence de notre projet :

```bash
mkdir ~/ansible-formation
cd ~/ansible-formation
mkdir -p {inventory,playbooks,roles,group_vars,host_vars,templates}
```

Votre structure doit ressembler à :
```
ansible-formation/
├── inventory/           # Fichiers d'inventaire
├── playbooks/          # Nos playbooks
├── roles/             # Rôles Ansible (plus tard)
├── group_vars/        # Variables par groupe
├── host_vars/         # Variables par hôte
├── templates/         # Templates Jinja2
└── ansible.cfg        # Configuration Ansible
```

---

## 🐳 Étape 1 : Configuration de l'environnement Docker

### 1.1 Préparation des conteneurs de test

Créons nos "serveurs" virtuels avec Docker. Créez le fichier `docker-compose.yml` :

```yaml
version: '3.8'

services:
  # Serveurs web
  web1:
    image: ubuntu:20.04
    container_name: ansible-web1
    hostname: web1
    command: /bin/bash -c "apt update && apt install -y openssh-server python3 sudo && useradd -m -s /bin/bash ansible && echo 'ansible:ansible' | chpasswd && echo 'ansible ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && service ssh start && tail -f /dev/null"
    ports:
      - "2221:22"
    networks:
      - ansible-lab

  web2:
    image: ubuntu:20.04
    container_name: ansible-web2
    hostname: web2
    command: /bin/bash -c "apt update && apt install -y openssh-server python3 sudo && useradd -m -s /bin/bash ansible && echo 'ansible:ansible' | chpasswd && echo 'ansible ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && service ssh start && tail -f /dev/null"
    ports:
      - "2222:22"
    networks:
      - ansible-lab

  # Serveur base de données
  db1:
    image: ubuntu:20.04
    container_name: ansible-db1
    hostname: db1
    command: /bin/bash -c "apt update && apt install -y openssh-server python3 sudo && useradd -m -s /bin/bash ansible && echo 'ansible:ansible' | chpasswd && echo 'ansible ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && service ssh start && tail -f /dev/null"
    ports:
      - "2223:22"
    networks:
      - ansible-lab

  # Load balancer
  lb1:
    image: ubuntu:20.04
    container_name: ansible-lb1
    hostname: lb1
    command: /bin/bash -c "apt update && apt install -y openssh-server python3 sudo && useradd -m -s /bin/bash ansible && echo 'ansible:ansible' | chpasswd && echo 'ansible ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && service ssh start && tail -f /dev/null"
    ports:
      - "2224:22"
      - "8080:80"
    networks:
      - ansible-lab

networks:
  ansible-lab:
    driver: bridge
```

### 1.2 Lancement de l'infrastructure

```bash
# Lancer les conteneurs
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Attendre que les services SSH soient prêts (30 secondes)
sleep 30

# Tester les connexions SSH
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2221 'echo "Web1 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2222 'echo "Web2 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2223 'echo "DB1 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2224 'echo "LB1 OK"'
```

---

## ⚙️ Étape 2 : Installation d'Ansible

### 2.1 Installation selon votre OS

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

**macOS :**
```bash
# Avec Homebrew
brew install ansible

# Ou avec pip
pip3 install ansible
```

**Windows (WSL2) :**
```bash
# Dans WSL2 Ubuntu
sudo apt update
sudo apt install ansible
```

### 2.2 Vérification de l'installation

```bash
# Vérifier la version
ansible --version

# Vérifier que Python est disponible
python3 --version

# Vérifier les modules disponibles
ansible-doc -l | head -10
```

---

## 📋 Étape 3 : Configuration d'Ansible

### 3.1 Création du fichier ansible.cfg

Créez le fichier `ansible.cfg` :

```ini
[defaults]
# Inventaire par défaut
inventory = inventory/hosts.yml

# Désactiver la vérification des clés SSH (dev seulement !)
host_key_checking = False

# Utilisateur de connexion
remote_user = ansible

# Niveau de verbosité
callback_whitelist = profile_tasks, timer

# Timeout de connexion
timeout = 30

# Retry files
retry_files_enabled = False

[ssh_connection]
# Persistence des connexions SSH
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
pipelining = True

# Timeout SSH
ssh_timeout = 10
```

### 3.2 Création de l'inventaire

Créez le fichier `inventory/hosts.yml` :

```yaml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: localhost
          ansible_port: 2221
          ansible_user: ansible
          ansible_ssh_pass: ansible
        web2:
          ansible_host: localhost
          ansible_port: 2222
          ansible_user: ansible
          ansible_ssh_pass: ansible
      vars:
        ansible_python_interpreter: /usr/bin/python3
        server_role: frontend
        
    databases:
      hosts:
        db1:
          ansible_host: localhost
          ansible_port: 2223
          ansible_user: ansible
          ansible_ssh_pass: ansible
      vars:
        ansible_python_interpreter: /usr/bin/python3
        server_role: backend
        
    loadbalancers:
      hosts:
        lb1:
          ansible_host: localhost
          ansible_port: 2224
          ansible_user: ansible
          ansible_ssh_pass: ansible
      vars:
        ansible_python_interpreter: /usr/bin/python3
        server_role: proxy
        
    production:
      children:
        webservers:
        databases:
        loadbalancers:
      vars:
        environment: dev
        backup_enabled: true
```

---

## ⚡ Étape 4 : Premières commandes ad-hoc

### 4.1 Test de connectivité

```bash
# Test de base sur tous les serveurs
ansible all -m ping

# Test spécifique par groupe
ansible webservers -m ping
ansible databases -m ping
ansible loadbalancers -m ping
```

### 4.2 Collecte d'informations système

```bash
# Informations système complètes
ansible all -m setup

# Informations spécifiques
ansible all -m setup -a "filter=ansible_distribution*"
ansible all -m setup -a "filter=ansible_default_ipv4"
ansible all -m setup -a "filter=ansible_memory_mb"

# Commandes système
ansible all -m command -a "uptime"
ansible all -m command -a "df -h"
ansible all -m command -a "free -m"
```

### 4.3 Gestion des fichiers

```bash
# Créer un répertoire
ansible all -m file -a "path=/tmp/ansible-test state=directory"

# Créer un fichier
ansible all -m file -a "path=/tmp/ansible-test/hello.txt state=touch"

# Copier un fichier
echo "Hello Ansible!" > /tmp/test.txt
ansible all -m copy -a "src=/tmp/test.txt dest=/tmp/ansible-test/"

# Vérifier le contenu
ansible all -m command -a "cat /tmp/ansible-test/test.txt"
```

### 4.4 Installation de logiciels

```bash
# Mise à jour du cache des paquets
ansible all -m apt -a "update_cache=yes" --become

# Installation d'outils de base
ansible all -m apt -a "name=htop state=present" --become
ansible all -m apt -a "name=curl state=present" --become
ansible all -m apt -a "name=vim state=present" --become

# Installation multiple
ansible all -m apt -a "name=wget,git,tree state=present" --become

# Vérification des installations
ansible all -m command -a "which htop"
ansible all -m command -a "curl --version"
```

---

## 🔍 Étape 5 : Exploration et diagnostic

### 5.1 Exploration des modules

```bash
# Lister tous les modules
ansible-doc -l

# Chercher des modules spécifiques
ansible-doc -l | grep -i service
ansible-doc -l | grep -i user
ansible-doc -l | grep -i file

# Aide détaillée sur un module
ansible-doc service
ansible-doc user
ansible-doc copy

# Exemple d'utilisation
ansible-doc -s service
```

### 5.2 Gestion des utilisateurs

```bash
# Créer un utilisateur
ansible all -m user -a "name=testuser shell=/bin/bash" --become

# Ajouter à un groupe
ansible all -m user -a "name=testuser groups=sudo append=yes" --become

# Vérifier la création
ansible all -m command -a "id testuser"

# Supprimer l'utilisateur
ansible all -m user -a "name=testuser state=absent remove=yes" --become
```

### 5.3 Gestion des services

```bash
# Installer et démarrer un service
ansible webservers -m apt -a "name=nginx state=present" --become
ansible webservers -m service -a "name=nginx state=started enabled=yes" --become

# Vérifier le statut
ansible webservers -m service -a "name=nginx" --become
ansible webservers -m command -a "systemctl status nginx" --become

# Arrêter le service
ansible webservers -m service -a "name=nginx state=stopped" --become
```

---

## 🧪 Exercices pratiques

### Exercice 1 : Exploration des facts
1. Trouvez l'adresse IP de chaque serveur
2. Affichez la distribution Linux utilisée
3. Vérifiez l'espace disque disponible

**Solution :**
```bash
# 1. Adresses IP
ansible all -m setup -a "filter=ansible_default_ipv4"

# 2. Distribution
ansible all -m setup -a "filter=ansible_distribution*"

# 3. Espace disque
ansible all -m command -a "df -h /"
```

### Exercice 2 : Gestion de fichiers
1. Créez le dossier `/tmp/formation` sur tous les serveurs
2. Copiez le fichier `ansible.cfg` dans ce dossier sur tous les serveurs
3. Vérifiez que les permissions sont correctes (644)

**Solution :**
```bash
# 1. Créer le dossier
ansible all -m file -a "path=/tmp/formation state=directory"

# 2. Copier le fichier
ansible all -m copy -a "src=ansible.cfg dest=/tmp/formation/"

# 3. Vérifier les permissions
ansible all -m file -a "path=/tmp/formation/ansible.cfg mode=0644"
```

### Exercice 3 : Installation différenciée
1. Installez `curl` sur tous les serveurs
2. Installez `mysql-client` uniquement sur les serveurs web
3. Installez `mysql-server` uniquement sur les serveurs de base de données
4. Vérifiez que les installations ont réussi

**Solution :**
```bash
# 1. curl sur tous
ansible all -m apt -a "name=curl state=present" --become

# 2. mysql-client sur webservers
ansible webservers -m apt -a "name=mysql-client state=present" --become

# 3. mysql-server sur databases
ansible databases -m apt -a "name=mysql-server state=present" --become

# 4. Vérifications
ansible all -m command -a "which curl"
ansible webservers -m command -a "which mysql"
ansible databases -m command -a "systemctl status mysql" --become
```

---

## 🎯 Points de contrôle

Avant de passer au TP2, vérifiez que vous maîtrisez :

- [ ] **Installation Ansible** : Ansible est installé et opérationnel
- [ ] **Configuration** : Le fichier `ansible.cfg` est configuré correctement
- [ ] **Inventaire** : Vous savez créer et organiser un inventaire YAML
- [ ] **Commandes ad-hoc** : Vous exécutez des commandes sur plusieurs serveurs
- [ ] **Modules de base** : ping, setup, command, copy, file, apt, service, user
- [ ] **Groupes** : Vous ciblez des groupes spécifiques de serveurs
- [ ] **Troubleshooting** : Vous savez diagnostiquer les problèmes courants

---

## 🔧 Dépannage courant

### Problème : "Permission denied"
```bash
# Vérifier la connexion SSH
ssh ansible@localhost -p 2221

# Vérifier la configuration
ansible-config dump --only-changed
```

### Problème : "Module not found"
```bash
# Vérifier l'installation Python
ansible all -m raw -a "python3 --version"

# Réinstaller Python si nécessaire
ansible all -m raw -a "apt update && apt install -y python3" --become
```

### Problème : "Connection timeout"
```bash
# Vérifier que les conteneurs tournent
docker-compose ps

# Redémarrer si nécessaire
docker-compose restart
```

---

## 📚 Pour aller plus loin

### Documentation officielle
- [Ansible Modules](https://docs.ansible.com/ansible/latest/collections/index_module.html)
- [Ansible Configuration](https://docs.ansible.com/ansible/latest/reference_appendices/config.html)
- [Guide d'inventaire](https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html)

### Commandes utiles à retenir
```bash
# Lister tous les modules
ansible-doc -l

# Aide sur un module
ansible-doc nom_module

# Exemple d'utilisation d'un module
ansible-doc -s nom_module

# Tester la configuration
ansible-config dump --only-changed

# Lister l'inventaire
ansible-inventory --list

# Voir les variables d'un host
ansible-inventory --host web1
```

---

## ✅ Résumé du TP1

🎉 **Bravo !** Vous avez terminé votre première session pratique avec Ansible.

**Ce que vous avez appris :**
- Installation et configuration d'Ansible
- Création d'un environnement de test avec Docker
- Structure d'un projet Ansible
- Commandes ad-hoc essentielles
- Utilisation des modules de base
- Diagnostic et résolution de problèmes

**Prochaine étape :** TP2 - Création de votre premier playbook pour automatiser des tâches complexes !

---

## 🧹 Nettoyage (optionnel)

Si vous souhaitez nettoyer votre environnement :

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer les volumes (attention : perte de données)
docker-compose down -v

# Supprimer les images (optionnel)
docker system prune
```

> 💡 **Conseil** : Gardez cet environnement Docker, nous l'utiliserons pour tous les TPs suivants !