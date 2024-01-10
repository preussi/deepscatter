from datasets import load_dataset
from huggingface_hub import login

print("TEST")
login(token="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")
DATASET = 'DISCOX/DISCO-10M'
dataset = load_dataset(DATASET)
dataset.save_to_disk('./DISCO-10M')
