import pandas as pd
from sklearn.manifold import TSNE
from datasets import load_dataset
import numpy as np
from huggingface_hub import login

# Login to Hugging Face
login(token="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")

# Load the dataset
DATASET = 'DISCOX/yt8m-mtc'
dset = load_dataset(DATASET, split='train')
df = dset.to_pandas()
print(df.columns)

# Check for NaN values in 'audio_embedding_youtube' column
if df['clap'].isnull().sum() > 0:
    # If NaN values exist, drop them
    df.dropna(subset=['audio_embedding_youtube'], inplace=True)

# Extract embeddings
df_embed = df['clap']

# Now, you can safely convert the DataFrame to an array
array = np.array(df_embed.values.tolist())

# Apply t-SNE
tsne = TSNE(n_components=2, random_state=0)
tsne_result = tsne.fit_transform(array)
tsne_df = pd.DataFrame(data=tsne_result, columns=['x', 'y'])
tsne_df['_id'] = range(0, len(tsne_df))
tsne_df.to_csv('./yt8m-mtc_tsne.csv', index=False)
