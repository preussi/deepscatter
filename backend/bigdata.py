import pandas as pd 
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility, BulkInsertState
from datasets import load_dataset_builder, load_dataset, Dataset
from transformers import AutoTokenizer, AutoModel
from torch import clamp, sum

DATASET = 'DISCOX/DISCO-200K-high-quality'  # Huggingface Dataset to use
MODEL = 'laion/larger_clap_music_and_speech'  # Transformer to use for embeddings
COLLECTION_NAME = 'DISCO'  # Collection name
DIMENSION = 512  # Embeddings size
LIMIT = 10  # How many results to search for
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"

index_params = {
  "metric_type":"COSINE",
  "index_type":"IVF_SQ8",
  "params":{"nlist":1536}
}

connections.connect("default", host="milvus-standalone", port="19530", db_name="default")

if utility.has_collection(COLLECTION_NAME):
    utility.drop_collection(COLLECTION_NAME)

fields = [
    FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name='video_url_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_title_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='track_name_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_duration_youtube_sec', dtype=DataType.FLOAT),
    #FieldSchema(name='preview_url_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_view_count_youtube', dtype=DataType.FLOAT),
    #FieldSchema(name='video_thumbnail_url_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='search_query_youtube', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='video_description_youtube', dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name='track_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='album_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='artist_id_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='track_duration_spotify_ms', dtype=DataType.INT64), 
    #FieldSchema(name='primary_artist_name_spotify', dtype=DataType.VARCHAR, max_length=1000),
    #FieldSchema(name='explicit_content_spotify', dtype=DataType.BOOL),
    #FieldSchema(name='similarity_duration', dtype=DataType.FLOAT),  
    #FieldSchema(name='similarity_query_video_title', dtype=DataType.FLOAT),   
    #FieldSchema(name='similarity_query_description', dtype=DataType.FLOAT),   
    #FieldSchema(name='similarity_audio', dtype=DataType.FLOAT), 
    FieldSchema(name='audio_embedding_spotify', dtype=DataType.FLOAT_VECTOR, dim=DIMENSION),  
]

schema = CollectionSchema(fields=fields)
collection = Collection(name=COLLECTION_NAME, schema=schema)
collection.create_index(field_name="audio_embedding_spotify", index_params=index_params)
collection.load()

#collection = Collection("DISCO") 

dset = load_dataset(DATASET, split='train', )
#dset.set_format(columns=['video_url_youtube', 'track_id_spotify', 'audio_embedding_spotify'])
#df = pd.DataFrame(dset)
print("TEST")
#df = df[['video_url_youtube', 'track_id_spotify', 'audio_embedding_spotify']]

def insert_function(batch):
    insertable = [
        batch['video_url_youtube'],
        batch['track_id_spotify'],
        batch['audio_embedding_spotify']
    ]    
    collection.insert(insertable)

dset.map(insert_function, batched=True, batch_size=2048)
collection.flush()


#i = 0
#while ((20000*i+20000)<len(df.index)):
#    collection.insert(df[20000*i:(20000*i+20000)])
#    collection.flush()
#    i = i + 1
#collection.insert(df[20000*i:(len(df.index))])
#collection.flush()

