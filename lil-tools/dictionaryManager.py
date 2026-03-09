import json
import re

def load_json_without_comments(file_path):
    """Load JSON that might include comment lines (starting with //)."""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    # Remove comments (lines starting with //)
    json_str = ""
    for line in lines:
        stripped = line.strip()
        if not stripped.startswith("//"):
            json_str += line
    return json.loads(json_str)

def fix_dictionary(file_path):
    data = load_json_without_comments(file_path)
    
    for category, groups in data.items():
        for label in list(groups.keys()):
            correct_length = int(label)
            words = groups[label]
            words_to_remove = []
            for word in words:
                if len(word) != correct_length:
                    words_to_remove.append(word)
                    proper_label = str(len(word))
                    if proper_label not in groups:
                        groups[proper_label] = []
                    groups[proper_label].append(word)
            # Remove misclassified words
            for word in words_to_remove:
                groups[label].remove(word)
    
    return data

if __name__ == "__main__":
    file_path = r"c:\Users\ryans\Documents\GitHub\ryanlanesander.github.io\dictionaries.json"
    fixed_data = fix_dictionary(file_path)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, indent=4)
    print("Dictionary file updated successfully.")