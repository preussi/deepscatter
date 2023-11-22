from typing import Union
from search import que
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
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

time.sleep(60)

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
collection.load()

def int16_to_float32(x):
    return (x / 32767.0).astype(np.float32)

def float32_to_int16(x):
    x = np.clip(x, a_min=-1., a_max=1.)
    return (x * 32767.).astype(np.int16)

model = laion_clap.CLAP_Module(enable_fusion=False, amodel= 'HTSAT-base')
model.load_ckpt('music_speech_audioset_epoch_15_esc_89.98.pt') # download the default pretrained checkpoint.

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/search")
def search(query, collection):
    x = que(query)
    print("ANAN", x)
    return x
