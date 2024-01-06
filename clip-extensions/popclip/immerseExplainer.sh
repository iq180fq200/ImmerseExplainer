send_text() {
    curl -d "$POPCLIP_TEXT" --unix-socket /tmp/ImmerseExplainer.sock http://ImmerseExplainer
}

if ! send_text; then
    open -g -a Immerse\ Explainer
    sleep 2
    send_text
fi