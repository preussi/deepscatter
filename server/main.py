import os
import shutil
from typing import Union
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymilvus import connections
from pymilvus import Collection
import json
from laion_clap import CLAP_Module
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

class DatasetManager:
    def __init__(self, name, model_checkpoint, output_fields):
        self.name = name
        self.model = self.load_clap_model(model_checkpoint)
        self.collection = Collection(name)
        self.collection.load()
        self.output_fields = output_fields

    def load_clap_model(self, checkpoint_path):
        model = CLAP_Module(enable_fusion=False, amodel='HTSAT-base')
        model.load_ckpt(checkpoint_path)
        return model

    def search(self, input_embedding):
        output_fields = self.output_fields
        results = self.collection.search(
            data=[input_embedding],
            anns_field="embedding",
            param={"metric_type": "COSINE", "index_type": "FLAT"},
            limit=13,
            expr=None,
            output_fields=output_fields,
            consistency_level="Strong"
        )
        res = [{field: hit.entity.get(field) for field in output_fields} for hits in results for hit in hits]
        return res

    def query_by_id(self, id_list):
        output_fields = self.output_fields
        res = self.collection.query(
            expr=f"id in {id_list}",
            output_fields=output_fields+[f'embedding']
        )
        embedding = [res[0].get('embedding')]
        results = self.collection.search(
            data=embedding,
            anns_field='embedding', 
            param=search_params,
            limit=13,
            expr=None,
            output_fields=output_fields,
            consistency_level="Strong"
        )

        res = [{field: hit.entity.get(field) for field in output_fields} for hits in results for hit in hits]
        return res
    
    def audio_search (self, input):
        output_fields = self.output_fields
        results = self.collection.search(
            data=input,
            anns_field='embedding', 
            # the sum of `offset` in `param` and `limit` 
            # should be less than 16384.
            param=search_params,
            limit=13,
            expr=None,
            # set the names of the fields you want to 
            # retrieve from the search result.
            output_fields=output_fields,
            consistency_level="Strong"
        )
        res = [{field: hit.entity.get(field) for field in output_fields} for hits in results for hit in hits]
        return res
    
    def get_audio_embedding_from_filelist(self, x):
        audio_embedding = self.model.get_audio_embedding_from_filelist(x)
        return audio_embedding


dataset_configs = {
    "disco": {
        "model_checkpoint": "laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt",
        "output_fields": ['id', 'x', 'y', 'class', 'title', 'link']
    },
    "yt8m": {
        "model_checkpoint": "laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt",
        "output_fields": ['id', 'x', 'y', 'class', 'title', 'link']
    },
    "vctk": {
        "model_checkpoint": "laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt",
        "output_fields": ['id', 'x', 'y', 'class', 'title', 'link']
    },
    "musiccaps": {
        "model_checkpoint": "laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt",
        "output_fields": ['id', 'x', 'y', 'class', 'title', 'link']
    }
}

datasets = {name: DatasetManager(name, **config) for name, config in dataset_configs.items()}

# Example usage of the models
# This is just a placeholder function to illustrate how you might use the loaded models
# You'll need to adjust it according to your actual usage

@app.get("/search/{query}/{dataset}")
def search(dataset: str, query: str):
    manager = datasets.get(dataset)
    if not manager:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not found.")
    
    text_embedding = manager.model.get_text_embedding([query, ""])
    results = manager.search(text_embedding[0].tolist())
    return results

@app.get("/retrieve/{id}/{dataset}")
async def retrieve(id: int, dataset: str):
    manager = datasets.get(dataset)
    if not manager:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset}' not found.")
    
    result = manager.query_by_id([id])
    return result

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...), dataset: str = Form(...)):
    manager = datasets.get(dataset)
    # Save the file temporarily
    file_location = f"uploaded_files/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Process the audio file and run the search
    try:
        # Pass the dataset along with the file_location to the audio_search function
        audio_embedding = manager.get_audio_embedding_from_filelist([file_location])
        return manager.audio_search(audio_embedding)
    finally:
        # Optionally, delete the file after processing if it's no longer needed
        os.remove(file_location)

@app.get("/data/labels/{dataset}")
def get_labels(dataset: str):
    # Define the path to your JSON file
    json_file_path = os.path.join(f'data/labels/{dataset}.geojson')
    # Read the JSON file
    with open(json_file_path, 'r') as file:
        labels = json.load(file)
    # Return the JSON data as a response
    return labels






