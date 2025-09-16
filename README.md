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

6. Accéder aux stats HAProxy
```
http://localhost:8404  (admin / admin)
```

## Structure
- `inventories/dev`: inventaire et variables
- `playbooks`: site.yml, web.yml, db.yml, lb.yml
- `templates`: nginx, haproxy, mysql

## Détails importants

- Connexion Ansible via Docker: l'inventaire utilise `ansible_connection=docker`, pas de SSH nécessaire entre hôtes containers.
- Variables avec defaults+merge: les templates Jinja2 fusionnent `*_defaults` avec des overrides (ex: `_ng = nginx_defaults | combine(nginx, recursive=True)`). Évitez les merges auto en YAML pour prévenir les recursions.
- MySQL sans systemd: dans les containers Ubuntu, `mysqld` est lancé en mode daemon (`mysqld --daemonize`) et un wait `mysqladmin ping` assure la disponibilité avant la sécurisation root et la création des DBs/users.
- Backends HAProxy dynamiques: le template découvre les serveurs via `groups['web']` et référence leurs noms de containers.

## Cibles Make utiles

```
make up      # démarre l'infra Docker (compose)
make site    # déploie tout (pré-tâches + web + db + lb)
make web     # déploie uniquement Nginx
make db      # déploie uniquement MySQL
make lb      # déploie uniquement HAProxy
```

## Dépannage

- Problème MySQL (socket introuvable): relancer `make db` pour s'assurer du démarrage daemon et du wait; vérifier `/run/mysqld`.
- Connexion Ansible: installer les collections avec `ansible-galaxy collection install -r requirements.yml` et vérifier `ansible all -m ping`.
- LB ne répartit pas: vérifier que `web1` et `web2` répondent sur `/health` et relancer `make lb`.

Ajustez `inventories/dev/group_vars/*.yml` selon vos besoins.
