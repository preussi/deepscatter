import pandas as pd
import numpy as np
import json

DATASET_NAME = 'musiccaps'

with open('classes.json', 'r') as file:
    class_data = json.load(file)
classes = class_data['classes']

def update_cls_columns(csv_file):
    # Read the CSV file into a DataFrame
    data = pd.read_csv(csv_file)

    # Extract class names from class_data
    class_names = [cls['class'] for cls in class_data['classes']]
    
    # Ensure binary columns for each class are present (initialize to 0)
    for cls_name in class_names:
        data[cls_name] = 0  # Initialize all to zero

    # Update the binary columns based on the 'class' column values
    for index, row in data.iterrows():
        cls_name = row['class']  # 'class' column has the class names
        if cls_name in class_names:
            data.at[index, cls_name] = 1  # Set the appropriate column to 1

    # Save the modified DataFrame back to CSV
    data.to_csv(csv_file, index=False)
    print("Completed updating cls columns.")

def generate_labels(csv_file):
    data = pd.read_csv(csv_file)
    class_centers = data.groupby('class')[['x', 'y']].mean().reset_index()

    # Create GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "name": "LOCATION",
        "features": []
    }

    # Iterate over each class center and add it to the GeoJSON structure
    for index, row in class_centers.iterrows():
        feature = {
            "type": "Feature",
            "properties": {
                "LOCATION": row['class'],
                # Assuming 'cluster' and 'size' are static or can be calculated
                "cluster": 0,  # Replace or calculate as needed
                "size": 274196  # Replace or calculate as needed
            },
            "geometry": {
                "type": "Point",
                "coordinates": [row['x'], row['y']]
            }
        }
        geojson['features'].append(feature)

    # Save to a GeoJSON file
    with open('data/labels/'+DATASET_NAME+'.geojson', 'w') as f:
        json.dump(geojson, f)


# Usage example
csv_file = 'data/graph/'+DATASET_NAME+'_graph.csv'  # Ensure the path to your CSV file is correct
generate_labels(csv_file)
update_cls_columns(csv_file)