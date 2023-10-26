import pandas as pd

# Create a DataFrame from your dataset
data = pd.read_csv('mean_by_region.csv')  # Replace 'your_dataset.csv' with the path to your CSV file

# Group the data by 'region' and calculate the mean for each group, excluding the 'year' column
means = data.drop(columns=['year']).groupby('region').mean().round(4).reset_index()

# Save the result to a new CSV file or display it
means.to_csv('means_by_region_overall.csv', index=False)  # Save to a new CSV file