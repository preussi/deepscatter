from pymilvus import connections, db, utility
from pymilvus import Collection, FieldSchema, DataType
import numpy as np
import librosa
import torch
import laion_clap 

connections.connect(
  alias="default",
  host='milvus-standalone',
  port='19530',
  db_name="default"
)

search_params = {
    "metric_type": "COSINE", 
    "offset": 0, 
    "ignore_growing": False, 
    "params": {"nlist": 2048}
}

collection = Collection("DISCO") 

#collection.create_index(field_name="audio_embedding_spotify", index_params=index_params)

collection.load()
#collection.drop_index()

def int16_to_float32(x):
    return (x / 32767.0).astype(np.float32)

def float32_to_int16(x):
    x = np.clip(x, a_min=-1., a_max=1.)
    return (x * 32767.).astype(np.int16)

model = laion_clap.CLAP_Module(enable_fusion=False, amodel= 'HTSAT-base')
model.load_ckpt('music_speech_audioset_epoch_15_esc_89.98.pt') # download the default pretrained checkpoint.

# Get text embedings from texts:
text_data = ["metalcore", "ROCK"] 
text_embed = model.get_text_embedding(text_data)

results = collection.search(
    data=[text_embed[0]],
    anns_field="audio_embedding_spotify", 
    # the sum of `offset` in `param` and `limit` 
    # should be less than 16384.
    param=search_params,
    limit=10,
    expr=None,
    # set the names of the fields you want to 
    # retrieve from the search result.
    output_fields=['video_url_youtube'],
    consistency_level="Strong"
)

for hits in results:
    # get the IDs of all returned hits
    print(hits.ids)

    # get the distances to the query vector from all returned hits
    #print(hits.distances)
    for hit in hits:
        x = hit
        # get the value of an output field specified in the search request.
        # dynamic fields are supported, but vector fields are not supported yet.    
        print(hit.entity.get('video_url_youtube'))
        print(hit.distance)

hit.entity.get('track_id_spotify')
