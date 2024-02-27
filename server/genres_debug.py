import pandas as pd

def update_genre_columns(csv_file):
    # Read the CSV file into a DataFrame
    data = pd.read_csv(csv_file)

    # Assuming the 'class' column contains the genre information
    genres = ["Rock", "Classical", "Pop", "Country", "Jazz", "Hiphop", "Disco", "Metal", "Blues", "Reggae"]
    
    # Ensure binary columns for each genre are present (they already are, based on your CSV structure)
    # Reset these columns to 0 to correct any previous incorrect population
    for genre in genres:
        data[genre] = 0

    # Iterate over each row to set the correct genre column to 1
    for index, row in data.iterrows():
        genre = row['class']  # Using 'class' as the genre indicator
        if genre in genres:
            data.at[index, genre] = 1

    # Save the modified DataFrame back to CSV
    data.to_csv(csv_file, index=False)
    print("Completed updating genre columns.")

# Usage example
csv_file = 'data/graph.csv'  # Update with the correct path to your CSV file
update_genre_columns(csv_file)
