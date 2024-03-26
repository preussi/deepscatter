import pandas as pd 
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility, BulkInsertState
from datasets import load_dataset_builder, load_dataset, Dataset
from transformers import AutoTokenizer, AutoModel
from torch import clamp, sum
from huggingface_hub import login
import numpy as np

login(token="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")
DATASET = 'DISCOX/yt8m-mtc'
MODEL = 'laion/larger_clap_music_and_speech'  # Transformer to use for embeddings
COLLECTION_NAME = 'musiccaps'  # Collection name
DIMENSION = 512  # Embeddings size
LIMIT = 10  # How many results to search for
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"

index_params = {
  "metric_type":"COSINE",
  "index_type":"FLAT"
}

connections.connect("default", host="milvus-standalone", port="19530", db_name="default")

if utility.has_collection(COLLECTION_NAME):
    utility.drop_collection(COLLECTION_NAME)

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, max_length=1000, is_primary=True, auto_id=True),
    FieldSchema(name='links', dtype=DataType.VARCHAR, max_length=1000),  
    FieldSchema(name='audio_embedding_youtube', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION),  
]

schema = CollectionSchema(fields=fields, enable_dynamic_field=True)
collection = Collection(name=COLLECTION_NAME, schema=schema)
collection.create_index(field_name="audio_embedding_youtube", index_params=index_params)
collection.load()

# Read the CSV file
tsne_data = pd.read_csv('./new_data/yt8m-mtc_tsne.csv')
x_values = tsne_data['x'].tolist()
y_values = tsne_data['y'].tolist()
dset = load_dataset(DATASET, split='train')
data = dset.to_pandas()
print(data.columns)

def join_nested_list(nested_list):
    # Flatten the nested list and join with semicolon
    return ';'.join([item for sublist in nested_list for item in sublist if sublist is not None])

current_id = 0

def insert_function(batch, batch_index, batch_size):
    global current_id
    # Calculate the actual size of the current batch (it may be less than batch_size for the last batch)
    actual_batch_size = len(batch['clap'])
    # Create a range of IDs for this batch
    current_id += actual_batch_size

    # Prepare the data for insertion
    start_index = batch_index * batch_size
    end_index = start_index + actual_batch_size
    x_batch = x_values[start_index:end_index]
    y_batch = y_values[start_index:end_index]

    # Convert all values to strings
    links = [str(value) for value in batch['video_id']]
    x_values_str = [str(value) for value in x_batch]
    y_values_str = [str(value) for value in y_batch]

    # Prepare the rest of the data for insertion
    insertable = [
        links,
        batch['clap']
    ]

    collection.insert(insertable)


batch_size = 1536
num_batches = (len(dset) + batch_size - 1) // batch_size  # Calculate how many batches are needed

for batch_index in range(num_batches):
    start_index = batch_index * batch_size
    end_index = start_index + batch_size
    batch = dset[start_index:end_index]  # Slice the dataset for the current batch
    insert_function(batch, batch_index, batch_size)

collection.flush()
connections.disconnect("default")