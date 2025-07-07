import * as tf from '@tensorflow/tfjs';

export async function loadModel(path: string) {
  return tf.loadLayersModel(path);
}

export async function predict(model: tf.LayersModel, input: tf.Tensor) {
  return model.predict(input) as tf.Tensor;
}
