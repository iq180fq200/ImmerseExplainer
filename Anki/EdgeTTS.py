#!/usr/bin/env python3

"""
Basic example of edge_tts usage.
"""
import argparse
import asyncio
import os

import edge_tts

VOICE = "en-GB-SoniaNeural"

home = os.path.expanduser("~")
temp_file_dir = home + "/.ImmerseExplainer/"
if not os.path.exists(temp_file_dir):
    os.mkdir(temp_file_dir)


async def amain(TEXT, OUTPUT_FILE="tmp.mp3") -> None:
    """Main function"""
    OUTPUT_FILE = temp_file_dir + OUTPUT_FILE
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUTPUT_FILE)


def get_audio(TEXT, OUTPUT_FILE) -> None:
    asyncio.run(amain(TEXT, OUTPUT_FILE))


if __name__ == "__main__":
    # set arg as the word to be explained
    parser = argparse.ArgumentParser(
        description="enter the word to tts")
    parser.add_argument("--content", type=str, help="the word to tts")
    parser.add_argument("--file", type=str, required=False, help="the mp3 file name of the phrase")
    args = parser.parse_args()
    loop = asyncio.get_event_loop_policy().get_event_loop()
    try:
        loop.run_until_complete(amain(args.content, args.file))
    finally:
        loop.close()
