import { Chart } from '@sgratzl/chartjs-esm-facade';

export default function patchController(config, controller, extras) {
  Chart.register(controller, extras);
  config.type = controller.id;
  return config;
}
