import os
import time


def get_deck_id(deck_name: str):
    # get user home directory
    home = os.path.expanduser("~")
    mapping_file_dir = home + "/.ImmerseExplainer/"
    if not os.path.exists(mapping_file_dir):
        os.mkdir(mapping_file_dir)
    if not os.path.exists(mapping_file_dir + "deck_mapping.txt"):
        with open(mapping_file_dir + "deck_mapping.txt", "w") as f:
            f.write("Immerse Explainer,2059400110\n")

    with open(mapping_file_dir + "deck_mapping.txt", "r") as f:
        deck_mapping = f.readlines()
        print(deck_mapping)
        deck_mapping = [x.strip() for x in deck_mapping]
        print(deck_mapping)
        deck_mapping = [x.split(",") for x in deck_mapping]
        print(deck_mapping)
        deck_mapping = {x[0]: x[1] for x in deck_mapping}
        print(
            f"deck_mapping: {deck_mapping}"
        )
        if deck_name in deck_mapping.keys():
            print(f"{deck_name} already exists")
            deck_id = int(deck_mapping[deck_name])
        else:
            deck_id = _generate_deck_id(deck_name)
            print(f"encounter a new deck, create deck {deck_name}, id: {deck_id}")
            with open(mapping_file_dir + "deck_mapping.txt", "a+") as f1:
                f1.write(f"{deck_name},{deck_id}\n")

    return deck_id


def _generate_deck_id(deck_name):
    if deck_name == "Immerse Explainer":
        return 2059400110
    else:
        return int(time.time())

