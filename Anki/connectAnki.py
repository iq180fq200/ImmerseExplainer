import json
import urllib.request


def request(action, **params):
    return {'action': action, 'params': params, 'version': 6}


def invoke(action, **params):
    requestJson = json.dumps(request(action, **params)).encode('utf-8')
    response = json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8765', requestJson)))
    if len(response) != 2:
        raise Exception('response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('response is missing required error field')
    if 'result' not in response:
        raise Exception('response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response['result']


def update_deck(deckPath):
    result = invoke('importPackage', path=deckPath)
    if (result == True):
        print("import deck successfully")

def get_deck_list():
    response = invoke('deckNames')
    return response

def get_deck_name_and_id():
    response = invoke('deckNamesAndIds')
    return response

if __name__ == "__main__":
    print(get_deck_name_and_id())
    print(get_deck_list())