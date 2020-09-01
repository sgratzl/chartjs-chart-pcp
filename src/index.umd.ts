import { registry } from '@sgratzl/chartjs-esm-facade';
import { ParallelCoordinatesController, LogarithmicParallelCoordinatesController } from './controllers';
import { LineSegment, LinearAxis, LogarithmicAxis } from './elements';
import { PCPScale } from './scales';

export * from '.';

registry.addControllers(ParallelCoordinatesController, LogarithmicParallelCoordinatesController);
registry.addElements(LineSegment, LinearAxis, LogarithmicAxis);
registry.addScales(PCPScale);
