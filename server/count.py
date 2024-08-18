import pandas as pd

def count_classes_in_csv(file_path, class_column_name='class'):
    try:
        # Load the CSV file into a pandas DataFrame
        data = pd.read_csv(file_path)

        # Check if the class column exists in the DataFrame
        if class_column_name in data.columns:
            # Count the number of instances of each class
            class_counts = data[class_column_name].value_counts()
            print(f"Counts of each class in the '{class_column_name}' column:")
            print(class_counts)
        else:
            print(f"Error: Column '{class_column_name}' does not exist in the CSV file.")

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
file_path = 'data/graph/musiccaps_graph.csv'  # Replace with the path to your CSV file
count_classes_in_csv(file_path)
