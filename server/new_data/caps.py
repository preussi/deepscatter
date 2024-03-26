import pandas as pd
from datasets import load_dataset
import numpy as np
from huggingface_hub import login

# Login to Hugging Face
login(token="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")

# Load the dataset
DATASET = 'DISCOX/musiccaps-viz'
dset = load_dataset(DATASET, split='train')
df = dset.to_pandas()
print(df.columns)