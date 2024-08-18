#!/bin/bash
DATASET_NAME="musiccaps"
TILE_SIZE=20000

# Execute Python script
sudo docker-compose exec server python import.py

# Check if the Python script ran successfully
if [ $? -eq 0 ]; then
    echo "Python script executed successfully."
    # Execute a terminal command
    echo "Running a follow-up command..."
    sudo docker-compose exec server quadfeather --files ./data/graph/${DATASET_NAME}_graph.csv --tile_size $TILE_SIZE --destination $DATASET_NAME
    echo "Moving the output to the data directory..."
    sudo mv $DATASET_NAME ../deepscatter/data
    sudo mv $DATASET_NAME.html ../deepscatter
    echo "Done."
else
    echo "Python script failed."
fi
