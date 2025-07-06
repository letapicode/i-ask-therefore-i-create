import { Plugin, register } from './index';

const sample: Plugin = {
  name: 'sample',
  init() {
    console.log('sample plugin loaded');
  }
};

register(sample);
