from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

app = Flask(__name__)
CORS(app)  # Allows requests from your frontend

# Store your OpenAI API key securely (never hardcode in production)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY") or "sk-..."  # Replace with your key or set as env var
client = OpenAI(api_key=OPENAI_API_KEY)

@app.route('/api/ai-downward', methods=['POST'])
def ai_downward():
    user_input = request.json.get('input', '')
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    # --- Debugging added: log the user input ---
    print("DEBUG: Received user input:", user_input)

    # Compose the messages as in your OpenAI example
    messages = [
        {
            "role": "system",
            "content": [
                {
                    "type": "input_text",
                    "text": (
                        "**Context**\n\nWe are making word searches for the peacock streaming app. "
                        "Words should be general knowledge words tightly related to subtheme; subthemes should be a tight recognizable group within the theme. "
                        "\n\n**Pattern**\n\ntheme: subtheme : words\n\n**Examples**\n\n"
                        "nineties nostalgia : 90s fashion trends : croptop, overalls, flannels, denim, cargo, windbreaker, tracksuit, choker, bukethat, darklipstick, momjeans\n"
                        "funny fams : comedy subgenres : sitcom, slapstick, parody, spoof, satire, dark, sketch, romcom, mockumentary, improv, standup\n"
                        "hidden gem shows : gem stones : diamond, ruby, sapphire, emerald, amethyst, topaz, peridot, aquamarine, opal, jade\n\n"
                        "**Instructions**\n\nThe user will give a theme. Give 5 subthemes to choose from based on it, and 10 words for each subtheme.  Only print out the subtheme and word list for each subtheme in this format:\n\n"
                        "1. subtheme 1: word1, word2, word3....\n2. subtheme 2: word1, word2, word3...\netc.\n\n\"reroll\" as a response means think again."
                    )
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": user_input
                }
            ]
        }
    ]

    # --- Debugging added: log the outgoing messages ---
    print("DEBUG: Outgoing messages to API:", messages)

    # Call OpenAI API
    try:
        response = client.responses.create(
            model="gpt-4.1-nano",
            input=messages,
            text={"format": {"type": "text"}},
            reasoning={},
            tools=[],
            temperature=1,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )
        print("OpenAI response:", response)
        # Extract the text from the response: updated to iterate object properties
        result_text = ""
        if response and hasattr(response, "output") and response.output:
            for msg in response.output:
                # msg.content is a list of objects
                if hasattr(msg, "content") and msg.content:
                    for out in msg.content:
                        if getattr(out, "type", None) == "output_text":
                            result_text += getattr(out, "text", "")
        return jsonify({"result": result_text})
    except Exception as e:
        print("OpenAI error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)