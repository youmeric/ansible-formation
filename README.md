
# Rapport TP2 — Automatisation d’une infrastructure avec Ansible

## Objectif
Ce TP vise à automatiser le déploiement d’une stack web complète (front, back, proxy) avec Ansible, en environnement conteneurisé (Docker). Le projet est versionné sur la branche `TP2` du dépôt [ansible-formation](https://github.com/youmeric/ansible-formation).

## Architecture

```
web1 (port 2221)   web2 (2222)   db1 (2223)   lb1 (2224)
	|                  |             |           |
	|------------------|-------------|-----------|
			réseau local (localhost)
```

L’inventaire (`inventory/hosts.yml`) définit 4 hôtes simulés via SSH sur différents ports.

## Organisation des rôles et playbooks

- `setup-users.yml` : création des utilisateurs, installation des outils système, préparation des environnements de travail.
- `webserver-setup.yml` : installation et configuration de Nginx, PHP-FPM, création des vhosts et pages dynamiques.
- `database-setup.yml` : installation MariaDB, création de la base et des utilisateurs, tests de connexion.
- `site.yml` : orchestration globale, installation d’outils de diagnostic, génération d’un rapport Markdown.

## Inventaire (extrait)

```yaml
webservers:
  hosts:
	 web1: { port: 2221 }
	 web2: { port: 2222 }
databases:
  hosts:
	 db1: { port: 2223 }
loadbalancers:
  hosts:
	 lb1: { port: 2224 }
```

## Déploiement & tests

1. **Préparation des clés SSH**
	```bash
	for p in 2221 2222 2223 2224; do ssh-keygen -f "/root/.ssh/known_hosts" -R "[localhost]:$p"; done
	```
2. **Vérification des connexions**
	```bash
	ssh -o StrictHostKeyChecking=no ansible@localhost -p 2221 'echo "Web1 OK"'
	ssh -o StrictHostKeyChecking=no ansible@localhost -p 2222 'echo "Web2 OK"'
	ssh -o StrictHostKeyChecking=no ansible@localhost -p 2223 'echo "DB1 OK"'
	ssh -o StrictHostKeyChecking=no ansible@localhost -p 2224 'echo "LB1 OK"'
	```
3. **Lancement du playbook principal**
	```bash
	ansible-playbook -i inventory/hosts.yml playbooks/site.yml
	```

## Points techniques

- **Compatibilité conteneur** : démarrage des services via `service` ou scripts, pas de systemd.
- **Gestion des utilisateurs** : création, groupes, workspace, outils système.
- **Web** : Nginx + PHP-FPM, vhosts dynamiques, page d’accueil personnalisée.
- **Base de données** : MariaDB, création base/utilisateur, test de connexion applicatif.
- **Rapport système** : script bash généré et exécuté sur chaque hôte, rapport Markdown via Jinja2.

## Fichiers clés

- `playbooks/` : tous les playbooks et templates
- `inventory/hosts.yml` : inventaire YAML multi-environnements
- `ansible.cfg` : configuration Ansible
- `docker-compose.yml` : (si utilisé) pour simuler les hôtes


## Exemple de rapport généré

Après exécution du playbook principal, un rapport Markdown est généré sur chaque hôte :

```markdown
=== Vérification du système web1 ===
Date: 2025-09-18
Uptime: 12:34:56 up 1 day,  2:03,  2 users,  load average: 0.00, 0.01, 0.05
Utilisateurs connectés: 2
Espace disque:
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       20G   5G   15G  25% /
Mémoire:
			  total        used        free      shared  buff/cache   available
Mem:           2.0G        1.2G        0.5G        0.1G        0.3G        1.5G
Process web/db/ssh (approx):
nginx, php-fpm, mysqld, sshd
================================
```

## Retours d’expérience

- **Points positifs** : Ansible permet de tout automatiser, même en environnement conteneurisé. Les playbooks sont réutilisables et modulaires.
- **Difficultés rencontrées** : adaptation sans systemd, gestion des permissions SSH, synchronisation des services dans Docker.
- **Axes d’amélioration** : monitoring plus avancé, sécurité renforcée, gestion des erreurs plus fine.

## Pour aller plus loin

- Ajouter des handlers pour redémarrer les services
- Sécuriser les accès (firewall, sudoers)
- Monitoring avancé (Prometheus, Grafana)
