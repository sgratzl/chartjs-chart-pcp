export * from '.';

import { registry } from '@sgratzl/chartjs-esm-facade';
import { ParallelCoordinatesController, LogarithmicParallelCoordinatesController } from './controllers';
import { LineSegment, LinearAxis, LogarithmicAxis } from './elements';
import { PCPScale } from './scales';

registry.controllers.register(ParallelCoordinatesController);
registry.controllers.register(LogarithmicParallelCoordinatesController);
registry.elements.register(LineSegment);
registry.elements.register(LinearAxis);
registry.elements.register(LogarithmicAxis);
registry.scales.register(PCPScale);
