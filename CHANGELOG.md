# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

## [v1.1] - 2025-09-16
### Ajouté
- Workflow CI GitHub Actions (yamllint, ansible syntax-check, ansible-lint).
- README enrichi: connexion Docker, MySQL sans systemd, HAProxy stats, defaults+merge, make, dépannage.

## [v1.0] - 2025-09-16
### Initial
- Stack 3-tiers via Ansible: 2x Nginx, 1x MySQL, 1x HAProxy.
- Connexion Ansible via plugin Docker.
- Variables hiérarchiques avec defaults et merge dans les templates Jinja2.
- Démarrage MySQL sans systemd dans container, sécurisation root, DB+user.
- HAProxy backends dynamiques depuis l’inventaire, healthchecks /health.
- Makefile, scripts de test, requirements, docker-compose de lab.
