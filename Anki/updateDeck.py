import time

import genanki
import argparse
import os

from EdgeTTS import get_audio
from connectAnki import update_deck
from deckManager import get_deck_id

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
        fields=[context_to_be_fill, underline_words(context, word_indexes), explanation, phrase, audio_filled_context, audio_phrase])
    _qa_note = genanki.Note(
        model=_qa_model,
        fields=[underline_words(context, word_indexes), explanation, audio_filled_context, phrase, audio_phrase])
    return _fill_in_note, _qa_note

def _get_context_audio_file_name(f_au_prefix):
    return os.path.join(ROOT_DIR, f_au_prefix +"_c" + ".mp3")

def _get_phrase_audio_file_name(f_au_prefix):
    return os.path.join(ROOT_DIR, f_au_prefix +"_p" + ".mp3")


# main logic
if __name__ == "__main__":
    # parse parameters
    parser = argparse.ArgumentParser(
        description="enter the context, word indexes, explanation and optional mp3 file of the phrase you want to add "
                    "to the deck")
    parser.add_argument("--context", nargs='+', type=str, help="the context of the phrase")
    parser.add_argument("--word_indexes", nargs='+', type=int, help="the phrase", required=False)
    parser.add_argument("--explanation", nargs='+', type=str, help="the explanation of the phrase")
    parser.add_argument("--level", type=str, default='both', help="the mastery level of the phrase",choices=['application','understanding'])
    parser.add_argument('--deck_name', nargs='+', type=str, default='Immerse Explainer', help="the name of the deck")
    args = parser.parse_args()
    deck_name = ' '.join(args.deck_name)
    context = ' '.join(args.context)
    explanation = ' '.join(args.explanation)
    audio_pre = str(int(time.time()))
    # get user home directory
    home = os.path.expanduser("~")
    temp_file_dir = home + "/.ImmerseExplainer/"
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
    fill_in_note, qa_note = create_notes(fill_in_model, qa_model, context, args.word_indexes if args.word_indexes else [], explanation, audio_pre)
    # add note to deck
    if args.level == 'application':
        my_deck.add_note(fill_in_note)
    if args.level == 'understanding':
        my_deck.add_note(qa_note)
    # create package
    package = genanki.Package(my_deck)
    package.media_files = [_get_context_audio_file_name(audio_pre), _get_phrase_audio_file_name(audio_pre)]
    package.write_to_file(temp_file_dir + 'temp1.apkg')

    # import deck to Anki
    update_deck(temp_file_dir + 'temp1.apkg')
