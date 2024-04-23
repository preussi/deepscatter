import pandas as pd 
import numpy as np
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
from datasets import load_dataset_builder, load_dataset, Dataset
from huggingface_hub import login
from sklearn.manifold import TSNE
import json
from laion_clap import CLAP_Module
import torch

login(token="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")
DIMENSION = 512  # Embeddings size
LIMIT = 10  # How many results to search for
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"

DATASET = 'DISCOX/musiccaps-viz'
DATASET_NAME = 'musiccaps'
EMBEDDING_FIELD = 'audio_embedding_youtube'
LINK_FIELD = 'ID'
NAME_FIELD = 'Description'
MODEL = 'laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt'

index_params = {
  "metric_type":"COSINE",
  "index_type":"FLAT"
}

# Load the dataset
dataset = load_dataset(DATASET, split='train')
df = pd.DataFrame(dataset)
df = df[df[EMBEDDING_FIELD].notnull()]
df = df[df[EMBEDDING_FIELD].map(len) == 512]
print(df.columns.dtype)

# Apply t-SNE in a batched manner if necessary
tsne = TSNE(n_components=2, random_state=0)

def apply_tsne_batch(batch):
    return tsne.fit_transform(np.stack(batch[EMBEDDING_FIELD].values))

# Assuming the DataFrame is large, you might want to process it in chunks
chunk_size = 1000  # Adjust chunk size based on your system's capabilities
tsne_results = []

for start in range(0, df.shape[0], chunk_size):
    end = min(start + chunk_size, df.shape[0])
    tsne_results.append(apply_tsne_batch(df.iloc[start:end]))

tsne_df = pd.concat([pd.DataFrame(data=result, columns=['x', 'y']) for result in tsne_results], ignore_index=True)
df = pd.concat([df.reset_index(drop=True), tsne_df], axis=1)

# Initialize the model
model = CLAP_Module(enable_fusion=False, amodel='HTSAT-base')
model.load_ckpt('laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt')

# Embedding function
def embed(description):
    return model.get_text_embedding([description, ""], use_tensor=True)[0]

# Load class data
with open('classes.json', 'r') as file:
    class_data = json.load(file)
classes = class_data['classes']

# Generate embeddings for each class
class_embeddings = {cls['class']: embed(cls['description']) for cls in classes}

# Define cosine similarity function
def cosine_similarity(embedding1, embedding2):
    return torch.nn.functional.cosine_similarity(embedding1, embedding2, dim=0)

# Classify in batches
def classify_batch(batch):
    predicted_classes = []
    for embedding in batch[EMBEDDING_FIELD]:
        tensor_embedding = torch.tensor(embedding) if not isinstance(embedding, torch.Tensor) else embedding
        similarities = {cls: cosine_similarity(tensor_embedding, class_emb) for cls, class_emb in class_embeddings.items()}
        predicted_class = max(similarities, key=similarities.get)
        predicted_classes.append(predicted_class)
    return predicted_classes

df['class'] = pd.concat([pd.Series(classify_batch(df.iloc[start:end])) for start in range(0, df.shape[0], chunk_size)], ignore_index=True)
df['id'] = range(0, len(df))

# The remainder of your processing, such as saving files and updating databases, can proceed as already defined in your script


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
with open(DATASET_NAME+'_labels.geojson', 'w') as f:
    json.dump(geojson, f)

#BINARY COLUMNS FOR CLASS HIGHLIGTHING
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

# Usage example
csv_file = DATASET_NAME+'_graph.csv'  # Ensure the path to your CSV file is correct
update_cls_columns(csv_file)

connections.connect("default", host="milvus-standalone", port="19530", db_name="default")

with open('fields.json', 'r') as file:
    dataset_fields_data = json.load(file)
dataset_fields = [
    FieldSchema(name=field['name'], dtype=DataType[field['dtype']], max_length=field['max_length'])
    for field in dataset_fields_data['fields']
]

# Function to create collections based on the dataset fields

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="x", dtype=DataType.FLOAT, max_length=1000),
    FieldSchema(name="y", dtype=DataType.FLOAT, max_length=1000),
    FieldSchema(name="class", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=DIMENSION),
    ]

if utility.has_collection(DATASET_NAME):
    utility.drop_collection(DATASET_NAME)

schema = CollectionSchema(fields=fields, enable_dynamic_field=True)
collection = Collection(name=DATASET_NAME, schema=schema)
collection.create_index(field_name="embedding", index_params=index_params)  # Adjust as needed
collection.load()

current_id = 0

def insert_function(batch_index, batch_size):
    global current_id
    start_index = batch_index * batch_size
    end_index = start_index + batch_size

    # Prepare batch data
    insertable = [
        df['id'].iloc[start_index:end_index].tolist(),
        df['x'].iloc[start_index:end_index].tolist(),
        df['y'].iloc[start_index:end_index].tolist(),
        df['class'].iloc[start_index:end_index].tolist(),
        df[NAME_FIELD].iloc[start_index:end_index].tolist(),
        df[LINK_FIELD].iloc[start_index:end_index].tolist(),
        df[EMBEDDING_FIELD].iloc[start_index:end_index].tolist(),
    ]

    # Insert the batched data
    collection.insert(insertable)

batch_size = 1000  # Set the batch size to the length of the dataset
num_batches = (len(dataset) + batch_size - 1) // batch_size  # Calculate how many batches are needed

for batch_index in range(num_batches):
    start_index = batch_index * batch_size
    end_index = start_index + batch_size
    insert_function(batch_index, batch_size)

collection.flush()    

connections.disconnect("default")