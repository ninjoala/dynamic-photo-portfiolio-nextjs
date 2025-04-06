#!/bin/bash

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
  echo "Please run with sudo"
  exit 1
fi

# Backup hosts file
cp /etc/hosts /etc/hosts.backup

# Add entries for development subdomains
echo "
# Development subdomains for photo portfolio
127.0.0.1 newnanrealestatephotography.localhost
127.0.0.1 newnanfamilyphotography.localhost
127.0.0.1 newnanweddingphotography.localhost
127.0.0.1 newnaneventphotography.localhost
127.0.0.1 newnansportsphotography.localhost" >> /etc/hosts

echo "Hosts file updated successfully!"
echo "You can now access the development sites at:"
echo "http://newnanrealestatephotography.localhost:3000"
echo "http://newnanfamilyphotography.localhost:3000"
echo "http://newnanweddingphotography.localhost:3000"
echo "http://newnaneventphotography.localhost:3000"
echo "http://newnansportsphotography.localhost:3000" 