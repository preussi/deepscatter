import pandas as pd
import json

# Read CSV file
df = pd.read_csv('data/graph.csv')

# Convert x and y to numeric values (if they are not already)
df['x'] = pd.to_numeric(df['x'], errors='coerce')
df['y'] = pd.to_numeric(df['y'], errors='coerce')

# Group by 'class' and calculate mean coordinates
class_centers = df.groupby('class')[['x', 'y']].mean().reset_index()

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
with open('labels.geojson', 'w') as f:
    json.dump(geojson, f)

