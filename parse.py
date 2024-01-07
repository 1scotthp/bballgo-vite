import csv

def read_csv(file_path):
    with open(file_path, mode='r', encoding='utf-8') as file:
        return list(csv.DictReader(file))

def process_data(data):
    for row in data:
        guaranteed = row.pop('Guaranteed', None)

        # Find the last non-empty salary year column
        last_salary_year = next((year for year in reversed(row.keys()) if row[year]), None)
        if last_salary_year:
            # Place 'Guaranteed' in the next column after the last salary year
            last_salary_year_index = list(row.keys()).index(last_salary_year)
            print(row[last_salary_year],last_salary_year, last_salary_year_index)
            row_keys = list(row.keys())[:last_salary_year_index + 1] + list(row.keys())[last_salary_year_index + 1:]
            new_row = {key: row[key] if key in row else guaranteed for key in row_keys}
            new_row[-1] = row[last_salary_year]
            new_row[last_salary_year] = ''
            row.clear()
            row.update(new_row)
    return data

def write_csv(data, output_path):
    if data:
        keys = data[0].keys()
        with open(output_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)

# Example usage
input_path = 'NBA_Contracts_Player.csv'
output_path = 'NBA_Contracts_Player2.csv'
data = read_csv(input_path)
processed_data = process_data(data)
write_csv(processed_data, output_path)
