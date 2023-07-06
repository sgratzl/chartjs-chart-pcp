---
title: Logarithmic Scale
---

# Logarithmic Scale

<script setup>
import {config} from './log';
</script>

<PCPChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./log.ts#config [config]

<<< ./log.ts#data [data]

:::
