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
pca_df = pd.DataFrame(data=pca_result, columns=['PC1', 'PC2'])
pca_df = pca_df.multiply(800)


# Add identifiers to your DataFrame

pca_df['id'] = range(0, len(pca_df))  # Creates unique identifiers starting from 1
pca_df['name'] = df['track_name_spotify']
print(df['track_name_spotify'].head())
print(pca_df.head())


# Create nodes list
nodes = pca_df.apply(lambda row: {"id": row['id'], "x": row['PC1'], "y": row['PC2']}, axis=1).tolist()

# Optionally, create links list. Here, we'll create dummy links for illustration purposes:
# If you have actual relationships, you should use those instead


# Convert nodes and links into a dictionary
graph_data = {
    "nodes": nodes,
}

# Export the dictionary to a JSON file
with open('graph_data.json', 'w') as outfile:
    json.dump(graph_data, outfile)
  


