from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymilvus import connections, db, utility
from pymilvus import Collection, FieldSchema, DataType
import numpy as np
import librosa
import torch
import laion_clap 
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST, PUT, PATCH, GET, DELETE, OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

search_params = {
    "metric_type": "COSINE", 
    "offset": 0, 
    "ignore_growing": False, 
    "params": {"nlist": 2048}
}

#time.sleep(60)

connections.connect(
  alias="default",
  host='milvus-standalone',
  port='19530',
  db_name="default"
)

collection = Collection("DISCO") 
collection.load()

model = laion_clap.CLAP_Module(enable_fusion=False, amodel= 'HTSAT-base')
model.load_ckpt('music_speech_audioset_epoch_15_esc_89.98.pt') # download the default pretrained checkpoint.


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/search")
def search(query):
    x = que(query)
    print("ANAN", x)
    return x

def que (query: str):
    text_data = [query, "ROCK"] 
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

    return [hit.entity.get('video_url_youtube') for hits in results for hit in hits]