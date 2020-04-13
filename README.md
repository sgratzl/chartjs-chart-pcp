# Chart.js Parallel Coordinate Plots
[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting parallel coordinate plots (PCPs). Adding new chart type: `pcp`.

**Works only with Chart.js >= 2.8.0**

![Choropleth]()

[CodePen](https://codepen.io/sgratzl/pen/TODO)

## Install

```bash
npm install --save chart.js chartjs-chart-pcp
```

## Usage
see [Samples](https://github.com/sgratzl/chartjs-chart-pcp/tree/master/samples) on Github

## Options

The option can be set globally or per dataset

```ts
interface IPCPChartOptions {
}
```


## PCP


### Data Structure

```js

const config = {
  data: {
    labels: [],
    datasets: [{
      label: 'XX',
      data: [
        {

        },
        {

        }
      ]
    }]
  },
  options: {
  }
};

```
### Styling

```ts
interface IPCPFeatureOptions {
}
```

## Building

```sh
npm install
npm run build
```

[npm-image]: https://badge.fury.io/js/chartjs-chart-pcp.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-pcp
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-pcp/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-pcp/actions
