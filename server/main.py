import os
import shutil
from typing import Union
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pymilvus import connections
from pymilvus import Collection
import json
import laion_clap 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://ee-tik-vm054.ethz.ch:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
def hello():
    print("hello world")

@app.get("/search")
def search(query):
    x = que(query)
    return x

@app.get("/retrieve")
def retrieve(id):
    x = retrieve(id)
    return x

@app.get("/graph-data")
def get_graph_data():
    # Define the path to your JSON file
    json_file_path = os.path.join('graph_data.json')

    # Check if the file exists

    # Read the JSON file
    with open(json_file_path, 'r') as file:
        graph_data = json.load(file)

    # Return the JSON data as a response
    return graph_data

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    # Save the file temporarily
    file_location = f"uploaded_files/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process the audio file and run the search
    try: return audio_search(file_location)
    finally:
        # Optionally, delete the file after processing if it's no longer needed
        os.remove(file_location)

def retrieve(id: [] ):
    ids_to_query = id
    res = collection.query(
        expr=f"id in [{ids_to_query}]",
        offset=0,
        limit=8,
        output_fields=['video_url_youtube', 'preview_url_spotify', 'track_name_spotify', 'id'],
    )
    return res

def audio_search (file: str):
    # Directly get audio embeddings from audio files
    audio_file = [file, file]
    audio_embed = model.get_audio_embedding_from_filelist(x = audio_file, use_tensor=True)

    if audio_embed.requires_grad:
    # Detach and move to cpu if it's a gradient tensor
        audio_embed = audio_embed.detach()

    audio_embed = audio_embed.cpu().numpy()  # Convert tensor to numpy array
    input = audio_embed.tolist()  # Convert numpy array to list of lists

    results = collection.search(
        data=input,
        anns_field="audio_embedding_spotify", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['video_url_youtube', 'preview_url_spotify', 'primary_artist_name_spotify', 'track_name_spotify', 'id'],
        consistency_level="Strong"
    )

    return [(hit.entity.get('video_url_youtube'), hit.entity.get('preview_url_spotify'), hit.entity.get('primary_artist_name_spotify'), hit.entity.get('track_name_spotify'), hit.entity.get('id')) for hits in results for hit in hits]

def que (query: str):
    text_data = query.split('+')
    if len(text_data) > 1:
        text_embed = model.get_text_embedding(text_data)
        input = text_embed.sum(axis=0)
    else:
        text_data.append("")
        input = model.get_text_embedding(text_data)[0]
    results = collection.search(
        data=[input],
        anns_field="audio_embedding_spotify", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['video_url_youtube', 'preview_url_spotify', 'primary_artist_name_spotify', 'track_name_spotify', 'id'],
        consistency_level="Strong"
    )

    return [(hit.entity.get('video_url_youtube'), hit.entity.get('preview_url_spotify'), hit.entity.get('primary_artist_name_spotify'), hit.entity.get('track_name_spotify'), hit.entity.get('id')) for hits in results for hit in hits]