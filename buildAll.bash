echo "Building popclip extension"
rm -f dist/ImmerseExplainer.popclipextz
mkdir -p dist/ImmerseExplainer.popclipext
cp -r clip-extensions/popclip/* dist/ImmerseExplainer.popclipext
cd dist && zip -r ImmerseExplainer.popclipextz ImmerseExplainer.popclipext && rm -r ImmerseExplainer.popclipext

echo "Building Python Anki connector"
cd ../
rm -rf Anki/build/
rm -rf Anki/dist/
cd Anki && source .env/bin/activate && pyinstaller --onefile updateDeck.py && pyinstaller --onefile EdgeTTS.py && pyinstaller --onefile ProxyServer.py
