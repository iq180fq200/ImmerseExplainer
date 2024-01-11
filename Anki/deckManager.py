import os


def get_deck_id(deck_name: str):
    # get user home directory
    home = os.path.expanduser("~")
    mapping_file_dir = home + "/.ImmerseExplainer/"
    if not os.path.exists(mapping_file_dir):
        os.mkdir(mapping_file_dir)

    with open(mapping_file_dir + "deck_mapping.txt", "a+") as f:
        deck_mapping = f.readlines()
        deck_mapping = [x.strip() for x in deck_mapping]
        deck_mapping = [x.split(",") for x in deck_mapping]
        deck_mapping = {x[0]: x[1] for x in deck_mapping}
        if deck_name in deck_mapping.keys():
            deck_id = deck_mapping[deck_name]
        else:
            deck_id = _generate_deck_id(deck_name)
            f.write(f"{deck_name},{deck_id}\n")

    return deck_id


def _generate_deck_id(deck_name):
    if deck_name == "Immerse Explainer":
        return 2059400110
    return hash(deck_name)
