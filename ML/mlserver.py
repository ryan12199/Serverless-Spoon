from flask import Flask, json
from flask import request
import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow import keras
from tensorflow.keras import layers

api = Flask(__name__)

@api.route('/predict', methods=['GET'])
def makePrediction():
  model = keras.models.load_model('./')

  calories = request.args.get('calories') 
  carbs = request.args.get('carbs')
  fat = request.args.get('fat')
  protein = request.args.get('protein')
  chol = request.args.get('chol')
  sodium = request.args.get('sodium')
  servingWeight = request.args.get('servingWeight')
 

  sample = {
    "calories": int(calories),
    "Fat/g": int(fat),
    "Carbohydrates/g" : int(carbs),
    "Protein/g" : int(protein),
    "Cholesterol/mg": int(chol),
    "Sodium/mg" : int(sodium),
    "weightPerServing" : int(servingWeight)
  }

  input_dict = {name: tf.convert_to_tensor([value]) for name, value in sample.items()}
  predictions = model.predict(input_dict)

  print(
        "This recipe has a %.1f percent probability "
        "of being healthy according to the model" % (100 * predictions[0][0],))

  return json.dumps([{"percent" : (100 * predictions[0][0],)}])


if __name__ == '__main__':
    api.run(host= '0.0.0.0')