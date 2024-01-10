import pandas as pd 
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility, BulkInsertState
from datasets import load_dataset_builder, load_dataset, Dataset
from transformers import AutoTokenizer, AutoModel
from torch import clamp, sum
from huggingface_hub import login

login(token="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")
DATASET = 'DISCOX/DISCO-200K-high-quality'  # Huggingface Dataset to use
MODEL = 'laion/larger_clap_music_and_speech'  # Transformer to use for embeddings
COLLECTION_NAME = 'DISCO'  # Collection name
DIMENSION = 512  # Embeddings size
LIMIT = 10  # How many results to search for
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"

index_params = {
  "metric_type":"COSINE",
  "index_type":"IVF_PQ",
  "params":{"nlist":1536, "m":4}
}

connections.connect("default", host="milvus-standalone", port="19530", db_name="default")

#if utility.has_collection(COLLECTION_NAME):
#    utility.drop_collection(COLLECTION_NAME)

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name='video_url_youtube', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='video_title_youtube', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='track_name_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_duration_youtube_sec', dtype=DataType.FLOAT),
    FieldSchema(name='preview_url_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_view_count_youtube', dtype=DataType.FLOAT, max_length=1000),
    #FieldSchema(name='video_thumbnail_url_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='search_query_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_description_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='track_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='album_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='artist_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='track_duration_spotify_ms', dtype=DataType.INT64), 
    FieldSchema(name='primary_artist_name_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='explicit_content_spotify', dtype=DataType.BOOL),
    #FieldSchema(name='similarity_duration', dtype=DataType.FLOAT),  
    #FieldSchema(name='similarity_query_video_title', dtype=DataType.FLOAT),   
    #FieldSchema(name='similarity_query_description', dtype=DataType.FLOAT),   
    #FieldSchema(name='similarity_audio', dtype=DataType.FLOAT), 
    FieldSchema(name='audio_embedding_spotify', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION),  
]

schema = CollectionSchema(fields=fields, enable_dynamic_field=True)
collection = Collection(name=COLLECTION_NAME, schema=schema)
collection.create_index(field_name="audio_embedding_spotify", index_params=index_params)
collection.load()

dset = load_dataset('./DISCO-10M', split='train')

current_id = 0

def insert_function(batch):
    global current_id
    # Calculate the batch size
    batch_size = len(batch['audio_embedding_spotify'])
    # Create a range of IDs for this batch
    ids = list(range(current_id, current_id + batch_size))
    # Update the current ID counter
    current_id += batch_size
    # Prepare the data for insertion
    video_url_youtube = [name if name is not None else "" for name in batch['video_url_youtube']]
    video_title_youtube = [name if name is not None else "" for name in batch['video_title_youtube']]
    track_name_spotify = [name if name is not None else "" for name in batch['track_name_spotify']]
    preview_url_spotify = [name if name is not None else "" for name in batch['preview_url_spotify']]
    primary_artist_name_spotify = [name if name is not None else "" for name in batch['primary_artist_name_spotify']]
    insertable = [
        ids,  # Include the manually assigned IDs
        video_url_youtube,
        video_title_youtube,
        track_name_spotify,
        #batch['video_duration_youtube_sec'],
        preview_url_spotify,
        #batch['video_view_count_youtube'],
        #batch['video_thumbnail_url_youtube'],
        #batch['search_query_youtube'],
        #batch['video_description_youtube'],
        #batch['track_id_spotify'],
        #batch['album_id_spotify'],
        #batch['artist_id_spotify'],
        ##batch['track_duration_spotify_ms'],
        primary_artist_name_spotify,
        #batch['explicit_content_spotify'],
        #batch['similarity_duration'],
        #batch['similarity_query_video_title'],
        #batch['similarity_query_description'],
        #batch['similarity_audio'],
        batch['audio_embedding_spotify'],
    ]    
    collection.insert(insertable)

dset.map(insert_function, batched=True, batch_size=1536)
collection.flush()
connections.disconnect("default")