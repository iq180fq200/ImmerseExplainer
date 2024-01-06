import genanki
import argparse
import os

from connectAnki import update_deck


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
            {'name': 'Audio'},
        ],
        templates=[
            {
                'name': 'Card 1',
                'qfmt': '<div>{{ContextToBeFill}}</div><hr id="explanation_front"><div>{{Explanation}}</div>',
                'afmt': '''
                <div>{{FilledContext}}</div>
                {{#Audio}}<div>{{Audio}}</div>{{/Audio}}
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
            {'name': 'Audio'},
        ],
        templates=[
            {
                'name': 'Card 2',
                'qfmt': '<div>{{FilledContext}}</div>{{#Audio}}<div>{{Audio}}</div>{{/Audio}}',
                'afmt': '''
                <div>{{FilledContext}}</div>
                {{#Audio}}<div>{{Audio}}</div>{{/Audio}}
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


def create_notes(_fill_in_model, _qa_model, context: str, word_indexes: list[int], explanation: str, mp3_file: str = ""):
    context_to_be_fill = ""
    for idx, word in enumerate(context.split(" ")):
        print(word)
        if idx in word_indexes:
            context_to_be_fill += "_______" + " "
        else:
            context_to_be_fill += word + " "
    _fill_in_note = genanki.Note(
        model=_fill_in_model,
        fields=[context_to_be_fill, underline_words(context, word_indexes), explanation, mp3_file])
    _qa_note = genanki.Note(
        model=_qa_model,
        fields=[underline_words(context, word_indexes), explanation, mp3_file])
    return _fill_in_note, _qa_note


# main logic
if __name__ == "__main__":
    # parse parameters
    parser = argparse.ArgumentParser(
        description="enter the context, word indexes, explanation and optional mp3 file of the phrase you want to add "
                    "to the deck")
    parser.add_argument("--context", type=str, help="the context of the phrase")
    parser.add_argument("--word_indexes", nargs='+', type=int, help="the phrase")
    parser.add_argument("--explanation", type=str, help="the explanation of the phrase")
    parser.add_argument("--mp3_file", type=str, required=False, help="the mp3 file of the phrase")

    # get user home directory
    home = os.path.expanduser("~")
    temp_file_dir = home + "/.ImmerseExplainer/"
    if not os.path.exists(temp_file_dir):
        os.mkdir(temp_file_dir)

    # create tempt deck
    my_deck = genanki.Deck(
        2059400110,
        'Immerse Explainer')
    # create model
    fill_in_model = create_fill_in_model()
    qa_model = create_qa_model()
    # create note
    args = parser.parse_args()
    if args.mp3_file is None:
        fill_in_note, qa_note = create_notes(fill_in_model, qa_model, args.context, args.word_indexes, args.explanation)
    else:
        fill_in_note, qa_note = create_notes(fill_in_model, qa_model, args.context, args.word_indexes, args.explanation,
                                             "[sound:" + args.mp3_file + "]")
    # add note to deck
    my_deck.add_note(fill_in_note)
    my_deck.add_note(qa_note)
    # create package
    if args.mp3_file is None:
        genanki.Package(my_deck).write_to_file(temp_file_dir + 'temp.apkg')
    else:
        package = genanki.Package(my_deck)
        package.media_files = [args.mp3_file]
        package.write_to_file(temp_file_dir + 'temp.apkg')

    # import deck to Anki
    update_deck(temp_file_dir + 'temp.apkg')
