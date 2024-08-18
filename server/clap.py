import pandas as pd
import ast

# Read the CSV file
df = pd.read_csv('musiccaps.csv')
print(df['embedding'].dtype)