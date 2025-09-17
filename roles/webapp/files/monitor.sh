#!/bin/bash
# Script de monitoring compatible Docker

echo "=== Monitoring {{ app_name }} ==="
echo "Date: $(date)"
echo ""

# Processus (correction: pgrep au lieu de systemctl)
echo "🔍 Processus:"
echo "nginx: $(pgrep nginx | wc -l) processus"
echo "php-fpm: $(pgrep php-fpm | wc -l) processus"
echo ""

# Ports (correction: ss au lieu de netstat)
echo "🌐 Ports:"
ss -tlnp | grep :80 || echo "Port 80: Non accessible"
echo ""

# Espace disque
echo "💾 Espace disque:"
df -h / | tail -1
echo ""

# Mémoire
echo "🧠 Mémoire:"
free -h | head -2
echo ""

# Logs récents (correction: gestion d'erreur)
echo "📋 Logs récents:"
tail -3 /var/log/nginx/{{ app_name | lower | replace(' ', '-') }}-access.log 2>/dev/null || echo "Pas de logs nginx"