import os
import numpy as np
import librosa
import laion_clap
import torch
import pandas as pd
from datasets import Dataset

# Define the folder containing the audio files and the path to the CSV file
audio_folder = 'audio_files/ESC50'
csv_path = 'ESC-50-master/meta/esc50.csv'

# Load CSV data
metadata = pd.read_csv(csv_path)

# Initialize a dictionary to hold combined data
combined_data = {'filename': [], 'embedding': []}

# Instantiate the model
model = laion_clap.CLAP_Module(enable_fusion=False, amodel='HTSAT-base')
model.load_ckpt('laion_clap/music_audioset_epoch_15_esc_90.14.pt')  # Load the default pretrained checkpoint.

def int16_to_float32(x):
    return (x / 32767.0).astype(np.float32)

def float32_to_int16(x):
    x = np.clip(x, a_min=-1., a_max=1.)
    return (x * 32767.).astype(np.int16)

# List all WAV files in the directory
audio_files = [f for f in os.listdir(audio_folder) if f.endswith('.wav')]

# Process each audio file
for file_name in audio_files:
    file_path = os.path.join(audio_folder, file_name)
    # Load audio data
    audio_data, _ = librosa.load(file_path, sr=48000)  # Ensure sample rate is 48000 Hz
    audio_data = audio_data.reshape(1, -1)  # Reshape to (1, T)
    audio_data = torch.from_numpy(int16_to_float32(float32_to_int16(audio_data))).float()

    # Get audio embedding from the model
    audio_embed = model.get_audio_embedding_from_data(x=audio_data, use_tensor=True).detach().cpu().numpy().flatten()
    
    # Add filename and embedding to the combined data
    combined_data['filename'].append(file_name)
    combined_data['embedding'].append(audio_embed)

# Create DataFrame from combined data
combined_data_df = pd.DataFrame(combined_data)

# Merge CSV data with embeddings based on filenames
metadata.set_index('filename', inplace=True)
combined_data_df.set_index('filename', inplace=True)
final_df = metadata.join(combined_data_df)

# Convert to Hugging Face dataset
huggingface_dataset = Dataset.from_pandas(final_df)

# Save the dataset
huggingface_dataset.save_to_disk('huggingface_dataset')

print("All embeddings have been processed and merged with CSV data, then saved as a Hugging Face dataset.")
