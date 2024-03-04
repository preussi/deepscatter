import pandas as pd
from sklearn.manifold import TSNE
from datasets import load_dataset
import numpy as np
from huggingface_hub import login

# Login to Hugging Face
login(token="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")

# Load the dataset
DATASET = 'DISCOX/DISCO-200K-high-quality'
dset = load_dataset(DATASET, split='train')
df = dset.to_pandas()

# Extract embeddings
df_embed = df['audio_embedding_youtube']
array = np.array(df_embed.tolist())

# Apply t-SNE
tsne = TSNE(n_components=2, random_state=0)
tsne_result = tsne.fit_transform(array)

# Create a DataFrame with t-SNE results
tsne_df = pd.DataFrame(data=tsne_result, columns=['x', 'y'])
tsne_df['_id'] = range(0, len(tsne_df))

tsne_df.to_csv('tsne', index=False)
