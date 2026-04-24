#!/bin/bash
# Frontend deploy script for one.com

HOST="$1"
USER="$2"
PASS="$3"
PORT="${4:-22}"
SRC="$5"

echo "=========================================="
echo "  HemSolutions Frontend Deploy"
echo "=========================================="
echo "Host: $HOST"
echo "User: $USER"
echo "Port: $PORT"
echo "Source: $SRC"
echo ""

# Check source exists
if [ ! -d "$SRC" ]; then
    echo "❌ Source directory not found: $SRC"
    exit 1
fi

# Count files
FILE_COUNT=$(find "$SRC" -type f | wc -l)
echo "📦 Files to upload: $FILE_COUNT"
echo ""

# Create expect script for sftp
EXPECT_SCRIPT=$(cat <<'EOF'
#!/usr/bin/expect -f
set timeout 60
set host [lindex $argv 0]
set user [lindex $argv 1]
set pass [lindex $argv 2]
set port [lindex $argv 3]
set src [lindex $argv 4]

spawn sftp -oStrictHostKeyChecking=no -oPort=$port $user@$host
expect "password:"
send "$pass\r"

# Upload all files from dist
expect "sftp>"
send "lcd $src\r"

expect "sftp>"
send "cd .\r"

expect "sftp>"
send "put -r *\r"

expect "sftp>"
send "bye\r"

expect eof
EOF
)

echo "$EXPECT_SCRIPT" > /tmp/deploy.expect
chmod +x /tmp/deploy.expect

echo "🚀 Starting SFTP upload..."
expect /tmp/deploy.expect "$HOST" "$USER" "$PASS" "$PORT" "$SRC"

echo ""
echo "=========================================="
echo "  ✅ Frontend upload complete!"
echo "=========================================="
