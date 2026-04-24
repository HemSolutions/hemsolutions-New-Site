#!/bin/bash
# Deploy HemSolutions Frontend to one.com via SFTP

SFTP_HOST="ssh.cddf56yz6.service.one"
SFTP_USER="cddf56yz6_ssh"
SFTP_PASS="Khan4u2u"
LOCAL_DIR="./dist"
REMOTE_DIR="/hemsolutions-new"

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Uploading to one.com..."
# Using lftp for SFTP upload
lftp -u "$SFTP_USER,$SFTP_PASS" "$SFTP_HOST" <<EOF
set ssl:verify-certificate no
set sftp:auto-confirm yes
mirror -R --delete --verbose "$LOCAL_DIR" "$REMOTE_DIR"
bye
EOF

echo "Deployment complete!"
