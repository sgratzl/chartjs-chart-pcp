'use strict';

import * as Chart from 'chart.js';

const defaults = {};

Chart.defaults.pcp = Chart.helpers.configMerge(Chart.defaults.global, defaults);

const superClass = Chart.DatasetController.prototype;
export const ParallelCoordinates = (Chart.controllers.pcp = Chart.DatasetController.extend({}));
