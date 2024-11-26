import csv
import json

def create_JSON(CSVfilePath, outputFileName):
    with open(CSVfilePath, mode='r') as file:
        csv_reader = csv.reader(file)
        lines = []
        for row in csv_reader:
            lines.append(row)

    labelled_array= []
    

    for line in lines:
        question_dict = {
            "question": line[0],  # Question text
            "A": line[1],       # Option A
            "B": line[2],       # Option B
            "C": line[3],       # Option C
            "D": line[4],     # Option D
            "ANSWER": line[5] ,      # Correct Answer
            "CHATGPT": ""
        }
    
        labelled_array.append(question_dict)

    with open(outputFileName, 'w') as file:
        json.dump(labelled_array, file, indent=4)
    
    print(f"Created JSON file for {outputFileName}.")

create_JSON("./csv_files/prehistory_test.csv", "./json_files/history.json") # History
create_JSON("./csv_files/sociology_test.csv", "./json_files/sociology.json") # Sociology
create_JSON("./csv_files/computer_security_test.csv", "./json_files/computer_security.json") # Computer Security