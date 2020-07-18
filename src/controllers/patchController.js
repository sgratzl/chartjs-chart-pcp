import { Chart } from '@sgratzl/chartjs-esm-facade';

export default function patchController(config, controller, cb) {
  Chart.register(controller);
  if (cb) {
    cb();
  }
  config.type = controller.id;
  return config;
}
