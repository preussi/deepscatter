import re
import json

# Load configuration from a JSON file
with open('./config/config.json', 'r') as file:
    config = json.load(file)

def generate_html(template_path, output_path, replacements):
    try:
        # Read the template file
        with open(template_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # Generate color mappings string
        color_mappings = ',\n'.join([f"    '{cls['class']}': '{cls['color']}'" for cls in config['classes']])

        # Replace placeholders with actual values
        for placeholder, value in replacements.items():
            pattern = r'\b' + re.escape(placeholder) + r'\b'
            if placeholder == 'COLOR_MAPPINGS_PLACEHOLDER':
                content = re.sub(pattern, color_mappings, content)
            else:
                content = re.sub(pattern, value, content)

        # Write the modified content to a new file
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(content)

        print(f"HTML file generated successfully at {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

# Prepare domain and range for replacements
domain_str = ', '.join(f"'{cls['class']}'" for cls in config['classes'])
range_str = ', '.join(f"'{cls['color']}'" for cls in config['classes'])

# Define the placeholders and their replacement values
replacements = {
    'frontend_placeholder': config['frontend'],
    'server_placeholder': config['server'],
    'DATASET_NAME_PLACEHOLDER': config['DATASET_NAME'],
    'NAME_FIELD_PLACEHOLDER': config['NAME_FIELD'],
    'DOMAINS_PLACEHOLDER': domain_str,
    'RANGE_PLACEHOLDER': range_str,
    'COLOR_MAPPINGS_PLACEHOLDER': ''  # Placeholder for color mappings
}

# Specify the template path and the output path
template_path = 'index.html'
output_path = config['DATASET_NAME'] + '.html'

# Generate the HTML file
generate_html(template_path, output_path, replacements)
