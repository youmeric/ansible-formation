# Rapport TP1 — Ansible

Objectif: installer/configurer Ansible, déployer un lab Docker (4 hôtes SSH), réaliser des commandes ad‑hoc et valider la connectivité et la collecte de facts.

## Résumé exécutif
- Environnement prêt (Docker + Ansible). Inventaire YAML fonctionnel.
- Connexions SSH OK sur web1/web2/db1/lb1 via `ansible`/`ansible`.
- Modules ad‑hoc testés: `ping`, `setup`, `command`, `file`, `copy`.
- Points de blocage anticipés: SSH password, variable réservée `environment`, compatibilité Ansible/apt → stratégies documentées.

## Contexte & environnement
- OS poste: Linux (bash). Outils: Docker/Compose, Ansible.
- Lab: 4 conteneurs Ubuntu exposant SSH (2221..2224). LB expose aussi 8080.
- Projet structuré: `ansible.cfg`, `inventory/hosts.yml`, dossiers `group_vars/`, `host_vars/`, `playbooks/`, `roles/`, `templates/`.

## Étapes clés réalisées
1) Démarrage du lab
- Commandes: `docker-compose up -d` puis `docker-compose ps`; pause (~30s) pour SSH.
- Décision: activer `PasswordAuthentication yes` côté conteneurs pour simplifier les tests.

2) Configuration Ansible
- `ansible.cfg`: inventaire par défaut, `host_key_checking=False`, SSH ControlPersist, `pipelining=True`.
- Vérification: `ansible --version`, `ansible-config dump --only-changed`.

3) Inventaire YAML
- Groupes: `webservers`, `databases`, `loadbalancers`, regroupés sous `production`.
- Hôtes mappés sur `localhost` avec ports 2221..2224, `ansible_user`/`ansible_ssh_pass` définis.
- Ajout `ansible_ssh_common_args: -o StrictHostKeyChecking=no -o PreferredAuthentications=password` pour éviter prompts.
- Correction: éviter le nom réservé `environment` → `env_name: dev`.

4) Vérifications ad‑hoc
- Connectivité: `ansible all -m ping` (puis par groupe).
- Facts: `ansible all -m setup -a "filter=ansible_distribution*"`.
- Commandes système: `ansible all -m command -a "uptime"`.
- Fichiers: création de `/tmp/ansible-test` + copie d'un fichier de contrôle.

## Points de blocage rencontrés/anticipés et contournements
- SSH: Permission denied/publickey → activer password auth dans sshd, utiliser `ansible_ssh_pass`, forcer `PreferredAuthentications=password`, nettoyer `~/.ssh/known_hosts` si conflit de clés.
- Variable réservée: Warning sur `environment` → renommage en `env_name` pour éviter comportements inattendus.
- apt/Ansible/Python: selon versions d’images, erreurs de module `apt` → fallback au module `raw` pour `apt update`/`apt install` lorsque nécessaire.
- Disponibilité SSH: services pas encore prêts juste après `up` → insérer `sleep 30`.

## Contrôles de réussite
- `ansible all -m ping` retourne SUCCESS sur 4 hôtes.
- `ansible-inventory --list` reflète les groupes/variables attendus, sans warning réservé.
- `setup` renvoie la distribution Ubuntu et l’IP par défaut pour chaque hôte.
- Commande `which htop`/`curl --version` OK si installation via `raw`/`apt` effectuée.

## Décisions et bonnes pratiques
- Inventaire YAML centralisé + `ansible.cfg` minimaliste mais efficace.
- Désactivation temporaire du host key checking en environnement de lab uniquement.
- Préférence clés SSH à terme; mot de passe gardé ici pour pédagogie et rapidité.
- Utiliser `raw` comme solution de repli lorsque les modules gérés échouent (incompatibilités transitoires).

## Nettoyage
- `docker-compose down` (et `-v` si besoin de purger les volumes).

## Bilan
- Objectifs du TP atteints: lab opérationnel, inventaire correct, commandes ad‑hoc maîtrisées, compréhension des causes possibles de blocage et de leurs remèdes. Le projet est prêt pour enchaîner sur l’écriture de playbooks (TP2).
