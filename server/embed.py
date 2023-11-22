from pymilvus import connections, db
from pymilvus import Collection, FieldSchema, DataType
import numpy as np
import librosa
import torch
import laion_clap 

np.set_printoptions(threshold=np.inf)

connections.connect(
  alias="default",
  host='milvus-standalone',
  port='19530',
  db_name="default"
)

collection = Collection("DISCO") 

search_params = {
    "metric_type": "COSINE", 
    "offset": 5, 
    "ignore_growing": False, 
    "params": {"nlist": 1536}
}

def int16_to_float32(x):
    return (x / 32767.0).astype(np.float32)


def float32_to_int16(x):
    x = np.clip(x, a_min=-1., a_max=1.)
    return (x * 32767.).astype(np.int16)

model = laion_clap.CLAP_Module(enable_fusion=False, amodel= 'HTSAT-base')
model.load_ckpt('music_speech_audioset_epoch_15_esc_89.98.pt') # download the default pretrained checkpoint.