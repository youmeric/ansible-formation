SHELL := /bin/bash

up:
	docker compose build
	docker compose up -d

stop:
	docker compose down

reup: stop up

ping:
	ANSIBLE_CONFIG=./ansible.cfg ansible all -m ping

site:
	ANSIBLE_CONFIG=./ansible.cfg ansible-playbook playbooks/site.yml

web:
	ANSIBLE_CONFIG=./ansible.cfg ansible-playbook playbooks/web.yml

db:
	ANSIBLE_CONFIG=./ansible.cfg ansible-playbook playbooks/db.yml

lb:
	ANSIBLE_CONFIG=./ansible.cfg ansible-playbook playbooks/lb.yml
