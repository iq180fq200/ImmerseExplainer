import os
import time

from connectAnki import get_deck_name_and_id


def get_deck_id(deck_name: str):
    name2id_map = get_deck_name_and_id()
    if deck_name in name2id_map.keys():
        return int(name2id_map[deck_name])
    return _generate_deck_id(deck_name)


def _generate_deck_id(deck_name):
    if deck_name == "Immerse Explainer":
        return 2059400110
    else:
        return int(time.time())

if __name__ == "__main__":
    print(get_deck_id("Default"))