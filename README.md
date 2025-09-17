# Ansible TP Jour 3 — Rapport de déploiement

Ce dépôt contient le travail réalisé pendant le TP Jour 3, fait en parallèle avec le formateur. L’objectif: structurer un projet Ansible propre avec des rôles, gérer des secrets avec Ansible Vault, et déployer une petite application web (nginx + PHP-FPM) dans des conteneurs Docker jouant les rôles de serveurs.

## Architecture du projet
- `ansible.cfg`: configuration Ansible locale (inventaire par défaut, désactivation du host key checking, utilisateur distant, fichier du Vault, options SSH). Cela évite de passer ces paramètres en ligne de commande.
- `inventory.ini`: inventaire des hôtes pour le groupe `webservers`.
  - `web1` → `localhost:2221`, utilisateur `ansible`
  - `web2` → `localhost:2222`, utilisateur `ansible`
  - Variables de groupe pour assouplir SSH: `StrictHostKeyChecking=no`, et un mot de passe pour les tests (`ansible`).
- `docker-compose.yml`: définit deux conteneurs Ubuntu (web1, web2) avec SSH, PHP, sudo, etc. Ports exposés:
  - SSH: 2221→22 (web1), 2222→22 (web2)
  - HTTP: 8081→80 (web1), 8082→80 (web2)
  Les conteneurs démarrent `sshd` et restent en vie avec `sleep infinity`.

## Playbooks
- `revision-playbook.yml`: playbook d’échauffement pour valider l’environnement.
  - Affiche un message de bienvenue avec la date.
  - Installe des paquets de base (curl, wget, htop).
  - Crée un fichier d’infos `/tmp/infos-serveur.txt` puis en vérifie le contenu.
- `deploy-webapp.yml`: playbook principal qui utilise un rôle `webapp`.
  - `pre_tasks`: ping, affichage des facts utiles, attente de connexion.
  - `roles`: exécute le rôle `webapp` (installation, config, déploiement).
  - `post_tasks`: tests d’écoute du port `app_port`, test HTTP local, résumé final avec URLs (8081 et 8082).

## Rôle `webapp`
- `roles/webapp/defaults/main.yml`: variables par défaut du rôle.
  - `app_name`, `app_version`, `app_port` (80), `php_version` (8.3), `php_packages`, `nginx_user` (www-data), `nginx_document_root`.
- `roles/webapp/tasks/main.yml`: logique principale, découpée en étapes lisibles.
  1) Mise à jour APT et messages d’info.
  2) Installation de `nginx` et des paquets PHP-FPM (avec handlers de démarrage).
  3) Création du répertoire applicatif et des logs sous `{{ nginx_document_root }}`.
  4) Chargement des secrets (`include_vars: secrets.yml`).
  5) Déploiement applicatif: `index.php.j2` et `app.css`.
  6) Configuration nginx via `nginx-vhost.j2` + activation du site et suppression du site par défaut.
  7) Démarrage/enable des services `nginx` et `php-fpm`.
  8) Déploiement d’un script de monitoring simple.
- `roles/webapp/handlers/main.yml`: handlers pour `nginx` et `php-fpm` (`start`, `restart`, `reload`).
- `roles/webapp/templates/index.php.j2`: page PHP “dashboard”.
  - Affiche nom/vers. appli, serveur, versions (PHP, OS), et paramètres Ansible (`app_port`, `nginx_user`, etc.).
  - Montre des secrets Vault de manière partielle (API key tronquée) pour prouver le chargement.
  - Écrit un log d’accès simple dans `{{ nginx_document_root }}/logs/visits.log`.
- `roles/webapp/templates/nginx-vhost.j2`: Virtual Host nginx.
  - `listen {{ app_port }}`, `root {{ nginx_document_root }}`.
  - Config PHP-FPM via socket `php{{ php_version }}-fpm`.
  - Headers informatifs `X-Served-By` et `X-App-Name`.
- `roles/webapp/files/app.css`: styles pour le dashboard.
- `roles/webapp/files/monitor.sh`: script de monitoring adapté aux conteneurs (pgrep, ss, df, free, tail logs).
- `roles/webapp/handlers/`, `roles/webapp/files/`, `roles/webapp/templates/`: arborescence standard de rôle Ansible.

## Secrets (Ansible Vault)
- `secrets.yml`: chiffré via Ansible Vault (AES256). Contient des variables comme `api_key`, `secret_message`, `admin_password`.
- `vault-password.txt`: mot de passe de déchiffrement local (ici `Toto123!` pour les tests). Référencé dans `ansible.cfg` via `vault_password_file`.
- `test-vault.yml`: playbook de vérification du chargement des secrets et de la création d’un fichier protégé `/tmp/config-remplie-de-secrets.txt`.

## Exécution
- D démarrer l’environnement Docker:
  ```bash
  docker compose up -d
  ```
- Vérifier l’accès SSH et l’inventaire:
  ```bash
  ansible -i inventory.ini all -m ping
  ```
- Déployer la webapp:
  ```bash
  ansible-playbook deploy-webapp.yml
  ```
- Tester dans un navigateur:
  - web1: http://localhost:8081
  - web2: http://localhost:8082

## Points clés appris / démontrés
- Structuration d’un rôle Ansible complet avec `defaults/`, `tasks/`, `templates/`, `files/`, `handlers/`.
- Gestion des variables et des secrets via Ansible Vault et `include_vars`.
- Déploiement idempotent d’une app web (nginx + PHP-FPM) sur plusieurs hôtes.
- Tests post-déploiement avec le module `uri` et la ressource `wait_for`.
- Environnement de labo reproductible via `docker-compose`.

Ce README sert de rapport synthétique montrant que le TP a été suivi et compris, en reprenant ce qui a été fait étape par étape pendant la séance.
