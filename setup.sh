#!/bin/bash

# Load tar file
docker load -i skeb-sniper-linux.tar

# Change the image tag to skeb-sniper for convenience
docker tag luckywah/skeb-sniper skeb-sniper

# Run a minimal temporary container named 'temp' to copy files
echo "Starting temporary container 'temp' to copy files..."
docker run -d --name temp skeb-sniper

# Copy files from temp:/app to user directory
echo "Copying files from temp container to $HOME/skeb_sniper_data/app..."
mkdir -p "$HOME/skeb_sniper_data/app"
docker cp temp:/app "$HOME/skeb_sniper_data"

# Remove the temporary container
echo "Removing temporary container 'temp'..."
docker stop temp
docker rm temp

echo "Files copied to $HOME/skeb_sniper_data/app."

# Stop and remove any existing container
echo "Stopping and removing existing container if any..."
docker stop skeb-sniper-container 2>/dev/null
docker rm skeb-sniper-container 2>/dev/null

# Run the container
echo "Starting skeb-sniper container..."
sudo docker run -d --name skeb-sniper-container \
  --network host \
  -e DISPLAY="$DISPLAY" \
  -v "$HOME/.Xauthority:/root/.Xauthority:rw" \
  -v "$HOME/skeb_sniper_data/app:/app" \
  -v "$HOME/skeb_sniper_firefox:/root/.mozilla/firefox" \
  -v "$HOME/skeb_sniper_config:/root/.config/skebsniper" \
  -v "/etc/machine-id:/etc/machine-id:ro" \
  skeb-sniper

echo "Container started. Setup completed."