---
title: Tension
---

# Tension

<script setup>
import {config} from './tension';
</script>

<PCPChart
  :options="config.options"
  :data="config.data"
/>

### Code

:::code-group

<<< ./basic.ts#config [config]

<<< ./tension.ts#data [data]

:::
