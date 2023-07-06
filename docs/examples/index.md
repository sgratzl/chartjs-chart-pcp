---
title: Examples
---

# Examples

<script setup>
import {config} from './basic';
</script>

## Parallel Coordinates Plot

<PCPChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./basic.ts#config [config]

<<< ./basic.ts#data [data]

:::
