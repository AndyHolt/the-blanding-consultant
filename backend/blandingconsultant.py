from flask import Flask, request
from textgenrnn import textgenrnn
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
wcmodel = textgenrnn(weights_path="wcmodel_weights.hdf5")
# generation_temperature = 0.5
# generation_prefix = ""


def read_character_names():
    with open("wodehouse-characters-su.txt", "r") as f:
        real_chars = f.readlines()
    return [real_chars[i].rstrip("\n") for i in range(len(real_chars))]


real_name_list = read_character_names()


@app.route("/")
def generate_name(absurdity="Medium", prefix=None):
    """
    Produce a new character name. Check what is generated against the list of
    real characters, and if a real character has been generated, produce another
    one.

    - absurdity: Level of randomness (temperature) used for generating name.
                 Lower is more likely to produce real characters and realistic
                 names, at the increased risk of generating real, or simply
                 bland, names. Higher is likely to produce more unique and
                 interesting names, at risk of producing nonsense.
    - prefix: Beginning of string generated. Allows inputting of a first name or
              title which is then expanded to a full name.
    """
    absurdity = request.args.get("absurdity", default="Medium", type=str)
    prefix = request.args.get("prefix", default=None, type=str)

    match absurdity:
        case "Low":
            print("Low absurdity selected, using temperature 0.2")
            generation_temperature = 0.2
        case "Medium":
            print("Medium absurdity selected, using temperature 0.5")
            generation_temperature = 0.5
        case "High":
            print("High absurdity selected, using temperature 0.8")
            generation_temperature = 0.8
        case _:
            print("Invalid absurdity selected, using Medium")
            generation_temperature = 0.5

    generation_attempts = 0
    while True:
        generation_attempts = generation_attempts + 1
        gen_name = wcmodel.generate(
            temperature=generation_temperature, return_as_list=True, prefix=prefix
        )[0]
        if gen_name not in real_name_list:
            break

    character = new_name(gen_name, absurdity, prefix, generation_attempts)

    return {
        "name": character.char_name,
        "absurdity": character.absurdity,
        "prefix": character.prefix,
        "attempts": character.attempts,
    }


class new_name:
    def __init__(self, gen_name, absurdity, prefix, attempts):
        self.char_name = gen_name
        self.absurdity = absurdity
        self.prefix = prefix
        self.attempts = attempts
