# ansible-formation

for p in 2221 2222 2223 2224; do   ssh-keygen -f "/root/.ssh/known_hosts" -R "[localhost]:$p"; done



# Tester les connexions SSH
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2221 'echo "Web1 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2222 'echo "Web2 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2223 'echo "DB1 OK"'
ssh -o StrictHostKeyChecking=no ansible@localhost -p 2224 'echo "LB1 OK"'