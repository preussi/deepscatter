import numpy as np
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
from datasets import load_dataset, load_from_disk
from sklearn.manifold import TSNE
import json
from laion_clap import CLAP_Module
import torch
from huggingface_hub import login
import os
import soundfile as sf

with open('./config/config.json', 'r') as file:
    config = json.load(file)    

# Authenticate and set up parameters
login(token="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")
DIMENSION = 512
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"

DATASET = config['DATASET']
DATASET_NAME = config['DATASET_NAME']
EMBEDDING_FIELD = config['EMBEDDING_FIELD']
LINK_FIELD = config['LINK_FIELD']
NAME_FIELD = config['NAME_FIELD']
MODEL = config['MODEL']

# Load the dataset directly into the Dataset object
dataset = load_from_disk('dataset_files')  # Adjust the path as needed
save_directory = "audio_files/"+DATASET_NAME

# Ensure the directory exists
os.makedirs(save_directory, exist_ok=True)

print("Dataset:", dataset)

for item in dataset:
    audio_array = item['audio']['array']
    sampling_rate = item['audio']['sampling_rate']
    file_name = item['file']
    file_name = file_name.split('/')[-1]
    output_file_path = os.path.join(save_directory, file_name)

    try:
        # Write the audio array to a file
        sf.write(output_file_path, audio_array, sampling_rate)
        print(f"File saved to {output_file_path}")
    except Exception as e:
        print(f"Failed to save file {output_file_path}: {str(e)}")
