import json
import time
from pathlib import Path

import genanki
import os

from EdgeTTS import get_audio
from connectAnki import update_deck
from deckManager import get_deck_id
import socket

home = os.path.expanduser("~")
ROOT_DIR = home + "/.ImmerseExplainer/"


def underline_words(context, indexes):
    words = context.split()
    for i in range(len(words)):
        if i in indexes:
            words[i] = f"<u>{words[i]}</u>"
    return ' '.join(words)


def create_fill_in_model():
    model = genanki.Model(
        1607392319,
        'Fill In Model',
        fields=[
            {'name': 'ContextToBeFill'},
            {'name': 'FilledContext'},
            {'name': 'Explanation'},
            {'name': 'phrase'},
            {'name': 'Audio_filled_context'},
            {'name': 'Audio_phrase'},
        ],
        templates=[
            {
                'name': 'Card 1',
                'qfmt': '<div>{{ContextToBeFill}}</div><hr id="explanation_front"><div>{{Explanation}}</div>',
                'afmt': '''
                <div>{{FilledContext}}</div>
                {{#Audio_filled_context}}<div>{{Audio_filled_context}}</div>{{/Audio_filled_context}}
                {{phrase}}{{#Audio_phrase}}<div>{{Audio_phrase}}</div>{{/Audio_phrase}}
                <hr id="explanation_back">{{Explanation}}
                ''',
            },
        ],
        css="""
            .card {
                font-family: arial;
                font-size: 20px;
                text-align: center;
                color: black;
                background-color: white;
            }
            """
    )
    return model


def create_qa_model():
    model = genanki.Model(
        1607392320,
        'Q-A Model',
        fields=[
            {'name': 'FilledContext'},
            {'name': 'Explanation'},
            {'name': 'Audio_filled_context'},
            {'name': 'phrase'},
            {'name': 'Audio_phrase'},
        ],
        templates=[
            {
                'name': 'Card 2',
                'qfmt': '''
                <div>{{FilledContext}}</div>
                {{#Audio_phrase}}<div>{{Audio_phrase}}</div>{{/Audio_phrase}}
                ''',
                'afmt': '''
                <div>{{FilledContext}}</div>
                {{#Audio_filled_context}}<div>{{Audio_filled_context}}</div>{{/Audio_filled_context}}
                <hr id="explanation_back">{{Explanation}}
                ''',
            },
        ],
        css="""
            .card {
                font-family: arial;
                font-size: 20px;
                text-align: center;
                color: black;
                background-color: white;
            }
            """
    )
    return model


def create_notes(_fill_in_model, _qa_model, context: str, word_indexes: list[int], explanation: str, f_au_pref):
    context_to_be_fill = ""
    phrase = ""
    for idx, word in enumerate(context.split(" ")):
        if idx in word_indexes:
            context_to_be_fill += word[0] + "_______" + " "
            phrase += word + " "
        else:
            context_to_be_fill += word + " "
    get_audio(context, f"{f_au_pref}_c.mp3")
    audio_filled_context = f"[sound:{f_au_pref}_c.mp3]"
    get_audio(phrase, f"{f_au_pref}_p.mp3")
    audio_phrase = f"[sound:{f_au_pref}_p.mp3]"
    _fill_in_note = genanki.Note(
        model=_fill_in_model,
        fields=[context_to_be_fill, underline_words(context, word_indexes), explanation, phrase, audio_filled_context,
                audio_phrase])
    _qa_note = genanki.Note(
        model=_qa_model,
        fields=[underline_words(context, word_indexes), explanation, audio_filled_context, phrase, audio_phrase])
    return _fill_in_note, _qa_note


def _get_context_audio_file_name(f_au_prefix):
    return os.path.join(ROOT_DIR, f_au_prefix + "_c" + ".mp3")


def _get_phrase_audio_file_name(f_au_prefix):
    return os.path.join(ROOT_DIR, f_au_prefix + "_p" + ".mp3")


def process_request(data):
    context = data['context']
    word_indexes = data['word_indexes']
    explanation = data['explanation']
    level = data['level']
    deck_name = data['deck_name']

    audio_pre = str(int(time.time()))
    # get user home directory
    temp_file_dir = ROOT_DIR
    if not os.path.exists(temp_file_dir):
        os.mkdir(temp_file_dir)

    # create tempt deck
    my_deck = genanki.Deck(
        get_deck_id(deck_name),
        deck_name)
    # create model
    fill_in_model = create_fill_in_model()
    qa_model = create_qa_model()
    # create note
    fill_in_note, qa_note = create_notes(fill_in_model, qa_model, context,
                                         word_indexes if word_indexes else [], explanation, audio_pre)
    # add note to deck
    if level == 'application':
        my_deck.add_note(fill_in_note)
    if level == 'understanding':
        my_deck.add_note(qa_note)
    # create package
    package = genanki.Package(my_deck)
    package.media_files = [_get_context_audio_file_name(audio_pre), _get_phrase_audio_file_name(audio_pre)]
    package.write_to_file(temp_file_dir + 'temp1.apkg')

    # import deck to Anki
    update_deck(temp_file_dir + 'temp1.apkg')
    return "Success"


def start_server():
    # Define the socket path
    socket_path = Path('/tmp/updateDeck.sock')

    # Delete the socket file if it already exists
    if socket_path.exists():
        print('Socket file already exists, deleting it...')
        socket_path.unlink()
    else:
        print('Socket file does not exist, creating it...')

    # Create a UNIX socket
    server_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

    # Bind the socket to the path
    server_socket.bind(str(socket_path))

    # Listen for incoming connections
    server_socket.listen()
    print(f"Server listening on {socket_path}")
    while True:
        conn, addr = server_socket.accept()
        with conn:
            print(f"Connected by {addr}")
            data = conn.recv(1024)
            if not data:
                break
            # Decode and process the data
            request_data = json.loads(data.decode())
            response = process_request(request_data)
            conn.sendall(response.encode())


if __name__ == "__main__":
    start_server()
