from sklearn.decomposition import PCA
from datasets import load_dataset
from huggingface_hub import login
import pandas as pd   
import numpy as np
import json


login(token="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")
DATASET = 'DISCOX/DISCO-200K-high-quality'

dset = load_dataset(DATASET, split='train')
df = dset.to_pandas()

df_embed = df['audio_embedding_spotify']

array = np.zeros((200000, 512))
for i in range (0, df_embed.size):
    array[i] = df_embed[i]



# Assuming `array` contains your data to apply PCA on and is already scaled
# If not scaled:
# scaler = StandardScaler()
# scaled_array = scaler.fit_transform(array)

# Apply PCA with two components (for 2D visualization)
pca = PCA(n_components=2)

# Fit PCA on the scaled data
pca_result = pca.fit_transform(array)  # Replace `array` with `scaled_array` if necessary

# Create a DataFrame with PCA results
pca_df = pd.DataFrame(data=pca_result, columns=['x', 'y'])


# Add identifiers to your DataFrame

pca_df['id'] = range(0, len(pca_df))  # Creates unique identifiers starting from 1
pca_df['track'] = df['track_name_spotify']
pca_df['url'] = df['video_url_youtube']

pca_df.to_csv('pca_results.csv', columns=['x', 'y', 'id', 'track', 'url'], index=False)


