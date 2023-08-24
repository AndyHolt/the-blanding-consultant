from flask import Flask, request
from textgenrnn import textgenrnn
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model_data_initialised = False

wcmodel = None
real_name_list = None


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
    global wcmodel
    global real_name_list
    global model_data_initialised

    if not model_data_initialised:
        print("Initialising model and data in generate_name function...")
        init_model_data()
        print("Model and data initalised, getting on with request now...")

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


@app.route("/_ah/warmup")
def init_model_data():
    """
    Set up model and data. Used for warm up request to improve serve time
    """
    global wcmodel
    global real_name_list
    global model_data_initialised

    wcmodel = textgenrnn(weights_path="wcmodel_weights.hdf5")
    real_name_list = read_character_names()
    model_data_initialised = True

    return "", 200, {}


def read_character_names():
    with open("wodehouse-characters-su.txt", "r") as f:
        real_chars = f.readlines()
    return [real_chars[i].rstrip("\n") for i in range(len(real_chars))]


class new_name:
    def __init__(self, gen_name, absurdity, prefix, attempts):
        self.char_name = gen_name
        self.absurdity = absurdity
        self.prefix = prefix
        self.attempts = attempts
