# TP3 Ansible - Stack Web avancée

## Prérequis
- Docker + Docker Compose
- Ansible 2.14+

## Démarrage rapide

1. Construire et lancer l'infra docker
```
make up
```

2. Installer les collections Ansible
```
ansible-galaxy collection install -r requirements.yml
```

3. Vérifier connectivité
```
ansible all -m ping
```

4. Déployer l'infrastructure complète
```
ansible-playbook playbooks/site.yml
```

5. Vérifier le LB
```
./scripts/check_lb.sh 172.28.0.14 6
```

## Structure
- `inventories/dev`: inventaire et variables
- `playbooks`: site.yml, web.yml, db.yml, lb.yml
- `templates`: nginx, haproxy, mysql

Ajustez `inventories/dev/group_vars/*.yml` selon vos besoins.
