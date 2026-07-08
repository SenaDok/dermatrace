if (typeof process === 'undefined') {
  global.process = { env: {} };
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
