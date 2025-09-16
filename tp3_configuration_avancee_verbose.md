# TP3 - Configuration Avancée d'Infrastructure avec Ansible

## Déploiement d'une stack web complète utilisant variables, templates et structures de contrôle

**Durée estimée :** Deux heures
**Objectif pédagogique :** Maîtriser l'utilisation avancée des variables Ansible, la création de templates Jinja2 dynamiques et l'implémentation de structures de contrôle pour déployer une infrastructure web robuste.

---

## Description de l'architecture cible

Vous allez déployer une infrastructure web moderne composée de trois couches distinctes. La première couche consiste en un load balancer HAProxy qui répartira le trafic entrant. La seconde couche comprend deux serveurs web Nginx configurés de manière identique mais avec des paramètres spécifiques à chaque instance. La troisième couche est constituée d'un serveur de base de données MySQL configuré pour accepter les connexions des serveurs web.

L'ensemble de cette infrastructure doit être déployé de manière automatisée en utilisant les fonctionnalités avancées d'Ansible, notamment la gestion hiérarchique des variables, les templates Jinja2 pour générer des configurations dynamiques, et les structures de contrôle pour adapter le comportement selon l'environnement.

---

## Organisation recommandée du projet

Vous devez organiser votre projet selon une structure hiérarchique claire qui sépare les différents types de fichiers. Créez un dossier principal pour votre formation Ansible. À l'intérieur, organisez les inventaires par environnement dans un sous-dossier dédié. Pour l'environnement de développement, créez un fichier d'inventaire principal ainsi qu'un dossier pour les variables de groupes et un autre pour les variables d'hôtes spécifiques.

Les playbooks doivent être regroupés dans leur propre dossier, avec un playbook principal qui orchestrera les autres, et des playbooks spécialisés pour chaque type de serveur. Enfin, créez un dossier pour les templates, organisé par service, où vous stockerez vos fichiers de configuration Jinja2.

---

## Première mission : Préparation de l'environnement de laboratoire

Commencez par étendre votre infrastructure Docker existante en ajoutant un nouveau conteneur qui servira de load balancer. Ce conteneur doit être basé sur Ubuntu vingt point zéro quatre et être nommé lb1. Configurez-le pour exposer le port quatre-vingts pour le trafic web et le port huit mille quatre cent quatre pour l'interface de statistiques HAProxy. Assurez-vous qu'il soit connecté au même réseau que vos autres conteneurs.

Une fois le conteneur ajouté au fichier docker-compose, procédez à un redémarrage propre de toute l'infrastructure. Arrêtez d'abord tous les conteneurs, puis relancez-les pour inclure le nouveau load balancer. Vérifiez que tous les conteneurs sont opérationnels et qu'Ansible peut communiquer avec eux en exécutant un test de connectivité sur tous les hôtes.

Mettez ensuite à jour votre fichier d'inventaire pour inclure le nouveau conteneur dans un groupe dédié aux load balancers. Organisez vos hôtes en groupes logiques : les serveurs web, les bases de données, et les load balancers. Chaque hôte doit avoir des variables spécifiques comme un identifiant de serveur unique et des paramètres de configuration adaptés à son rôle.

---

## Deuxième mission : Configuration avancée du système de variables

Vous devez maintenant créer une hiérarchie de variables sophistiquée qui permettra une configuration flexible et réutilisable. Commencez par définir les variables globales qui s'appliqueront à tous les serveurs de votre infrastructure. Ces variables incluent l'identification de l'environnement, le nom de domaine principal, les informations sur l'utilisateur applicatif, et les paramètres de sécurité généraux.

Pour les serveurs web, créez un fichier de variables spécifique qui définira la configuration Nginx. Incluez les paramètres de performance comme le nombre de processus worker, les connexions simultanées autorisées, et la configuration des virtual hosts. Définissez également les paramètres SSL si nécessaire et les options de sécurité spécifiques au serveur web.

Concernant la base de données, établissez les variables qui contrôleront l'installation et la configuration MySQL. Définissez les paramètres de connexion, les limites de performance adaptées aux ressources disponibles, et les informations sur les bases de données et utilisateurs à créer. Pensez à inclure des variables pour la sauvegarde automatique et la réplication si elle est prévue.

Pour le load balancer, configurez les variables qui détermineront le comportement HAProxy. Définissez la configuration du frontend, les algorithmes de répartition de charge, les paramètres de health check, et la configuration de l'interface de statistiques. Assurez-vous que ces variables permettront une configuration dynamique des serveurs backend.

---

## Troisième mission : Création de templates Jinja2 dynamiques

Votre prochaine étape consiste à créer des templates de configuration qui s'adapteront automatiquement selon l'environnement et les variables définies. Pour Nginx, créez un template de configuration principal qui ajustera automatiquement les paramètres de performance selon les ressources disponibles sur chaque serveur. Le template doit inclure des conditions pour activer ou désactiver certaines fonctionnalités selon l'environnement de déploiement.

Développez également un template pour les virtual hosts Nginx qui générera des configurations de site adaptées à chaque serveur web. Ce template doit pouvoir gérer plusieurs domaines, configurer automatiquement les redirections SSL si nécessaire, et adapter les paramètres de cache et de sécurité selon l'environnement.

Pour MySQL, créez un template de configuration qui optimisera automatiquement les paramètres selon la mémoire disponible sur le serveur. Le template doit ajuster la taille du buffer pool InnoDB, configurer les paramètres de réplication si elle est activée, et adapter les niveaux de logging selon l'environnement.

Concernant HAProxy, développez un template qui générera automatiquement la configuration du load balancer en se basant sur l'inventaire Ansible. Ce template doit découvrir dynamiquement les serveurs web disponibles, configurer les health checks appropriés, et adapter les paramètres de performance selon la charge attendue.

---

## Quatrième mission : Développement de playbooks avec structures de contrôle

Créez maintenant un playbook principal qui orchestrera le déploiement de toute l'infrastructure. Ce playbook doit commencer par valider que les prérequis système sont satisfaits sur tous les serveurs, notamment en vérifiant la mémoire disponible, l'architecture du processeur, et la version du système d'exploitation. Implémentez des tâches préliminaires qui mettront à jour les paquets système et créeront les utilisateurs nécessaires.

Développez un playbook spécialisé pour les serveurs web qui installera et configurera Nginx de manière robuste. Utilisez des blocs de gestion d'erreur pour capturer et traiter les échecs de configuration. Implémentez un déploiement en mode rolling pour éviter les interruptions de service, et ajoutez des validations pour vérifier que chaque serveur fonctionne correctement avant de passer au suivant.

Pour la base de données, créez un playbook qui sécurisera l'installation MySQL, créera les bases de données et utilisateurs nécessaires, et configurera les sauvegardes automatiques. Incluez des vérifications pour s'assurer que la base de données est accessible et que les permissions sont correctement configurées.

---

## Cinquième mission : Configuration du load balancer avec backend dynamique

Votre dernière mission consiste à créer un playbook sophistiqué pour HAProxy qui découvrira automatiquement les serveurs web disponibles et les configurera comme backends. Le playbook doit d'abord vérifier que des serveurs web sont présents dans l'inventaire et qu'ils sont accessibles avant de procéder à l'installation.

Implémentez une logique qui générera dynamiquement la liste des serveurs backend en se basant sur les groupes d'inventaire. Le playbook doit configurer automatiquement les poids de répartition selon les capacités de chaque serveur et implémenter des health checks pour détecter les serveurs défaillants.

Ajoutez des tests de validation qui vérifieront le bon fonctionnement du load balancing en effectuant plusieurs requêtes et en s'assurant qu'elles sont bien réparties entre les différents serveurs. Configurez également l'interface de monitoring HAProxy et testez son accessibilité.

---

## Validation et tests de l'infrastructure

Une fois tous les playbooks développés, procédez au déploiement complet de l'infrastructure en exécutant le playbook principal. Surveillez attentivement les logs pour identifier d'éventuelles erreurs et assurez-vous que tous les services démarrent correctement.

Effectuez des tests de connectivité pour vérifier que le load balancer distribue bien le trafic entre les serveurs web et que ces derniers peuvent communiquer avec la base de données. Testez les endpoints de health check et l'interface de statistiques HAProxy.

Validez également que vos templates génèrent des configurations correctes en consultant les fichiers créés sur chaque serveur et en vérifiant qu'ils correspondent aux variables définies.

---

## Livrables attendus

À l'issue de ce travail pratique, vous devez livrer une infrastructure complètement fonctionnelle et automatisée. L'ensemble doit démontrer une maîtrise des variables Ansible organisées de manière hiérarchique, des templates Jinja2 capables de s'adapter dynamiquement à l'environnement, et des playbooks robustes utilisant les structures de contrôle pour gérer les erreurs et les déploiements complexes.

Votre solution doit être reproductible et facilement adaptable à d'autres environnements grâce à une séparation claire entre la logique de déploiement et la configuration spécifique à l'environnement.