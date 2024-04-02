import os
import shutil
from typing import Union
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pymilvus import connections
from pymilvus import Collection
import json
import laion_clap 
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

search_params = {
    "metric_type": "COSINE", 
    "offset": 0, 
    "ignore_growing": False
}

#time.sleep(60)

connections.connect(
  alias="default",
  host='standalone',
  port='19530',
  db_name="default"
)

collection = Collection("DISCO") 
collection_caps = Collection("musiccaps")
collection_caps.load()
collection.load()

model = laion_clap.CLAP_Module(enable_fusion=False, amodel= 'HTSAT-base')
model.load_ckpt('laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt') # download the default pretrained checkpoint.

@app.get("/youtube-thumbnail/{video_id}")
async def get_youtube_thumbnail(video_id: str):
    # Attempt to fetch thumbnails starting from the highest resolution
    thumbnail_resolutions = ["maxresdefault", "sddefault", "mqdefault", "hqdefault", "default"]
    for resolution in thumbnail_resolutions:
        thumbnail_url = f"https://img.youtube.com/vi/{video_id}/{resolution}.jpg"
        # Check if the thumbnail URL is valid
        response = requests.head(thumbnail_url)
        if response.status_code == 200:
            return {"thumbnail_url": thumbnail_url}
    
    raise HTTPException(status_code=404, detail="Thumbnail not found.")


@app.get("/")
def hello():
    print("hello world")

@app.get("/caps-search")
def caps_search(query):
    x = caps_que(query)
    return x

@app.get("/search")
def search(query):
    x = que(query)
    return x

@app.get("/retrieve")
def retrieve(id):
    res = id_search(id)
    embedding = [res[0].get('audio_embedding_youtube')]
    print("test")
    print(embedding)
    x = click_search(embedding)
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

@app.get("/data/labels")
def get_labels():
    # Define the path to your JSON file
    json_file_path = os.path.join('data/labels.geojson')

    # Check if the file exists

    # Read the JSON file
    with open(json_file_path, 'r') as file:
        labels = json.load(file)

    # Return the JSON data as a response
    return labels

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

def id_search(id: [] ):
    ids_to_query = id
    res = collection.query(
        expr=f"id in [{ids_to_query}]",
        offset=0,
        limit=8,
        output_fields=['id', 'x', 'y', 'video_url_youtube', 'primary_artist_name_spotify', 'track_name_spotify', 'audio_embedding_youtube'],
    )
    return res

def click_search(input: list):
    results = collection.search(
        data=input,
        anns_field="audio_embedding_youtube", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['id', 'x', 'y', 'video_url_youtube', 'primary_artist_name_spotify', 'track_name_spotify'],
        consistency_level="Strong"
    )

    res = [(hit.entity.get('id'), hit.entity.get('x'), hit.entity.get('y'), 
            hit.entity.get('video_url_youtube'), hit.entity.get('primary_artist_name_spotify'), 
            hit.entity.get('track_name_spotify'), hit.entity.score) for hits in results for hit in hits]
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
        anns_field="audio_embedding_youtube", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['id', 'x', 'y', 'video_url_youtube', 'primary_artist_name_spotify', 'track_name_spotify'],
        consistency_level="Strong"
    )

    res = [(hit.entity.get('id'), hit.entity.get('x'), hit.entity.get('y'), 
            hit.entity.get('video_url_youtube'), hit.entity.get('primary_artist_name_spotify'), 
            hit.entity.get('track_name_spotify'), hit.entity.score) for hits in results for hit in hits]
    return res

def caps_que (query: str):

    if '+' in query:
        text_data = query.split('+')
        text_embed = model.get_text_embedding(text_data)
        input = text_embed.sum(axis=0)
    else:
        text_data = [query]
        text_data.append("")
        input = model.get_text_embedding(text_data)[0]

    results = collection_caps.search(
        data=[input],
        anns_field="audio_embedding_youtube", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['links'],
        consistency_level="Strong"
    )
    
    res = [(hit.entity.get('links'), hit.entity.get('id'), hit.entity.score) for hits in results for hit in hits]
    return res

def que (query: str):

    if '+' in query:
        text_data = query.split('+')
        text_embed = model.get_text_embedding(text_data)
        input = text_embed.sum(axis=0)
    else:
        text_data = [query]
        text_data.append("")
        input = model.get_text_embedding(text_data)[0]

    results = collection.search(
        data=[input],
        anns_field="audio_embedding_youtube", 
        # the sum of `offset` in `param` and `limit` 
        # should be less than 16384.
        param=search_params,
        limit=16,
        expr=None,
        # set the names of the fields you want to 
        # retrieve from the search result.
        output_fields=['id', 'x', 'y', 'video_url_youtube', 'primary_artist_name_spotify', 'track_name_spotify'],
        consistency_level="Strong"
    )
    
    res = [(hit.entity.get('id'), hit.entity.get('x'), hit.entity.get('y'), 
            hit.entity.get('video_url_youtube'), hit.entity.get('primary_artist_name_spotify'), 
            hit.entity.get('track_name_spotify'), hit.entity.score) for hits in results for hit in hits]
    
    return res
