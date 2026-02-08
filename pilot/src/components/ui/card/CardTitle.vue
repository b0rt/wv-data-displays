<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <h3 :class="cn('text-xs font-medium uppercase tracking-widest text-muted-foreground', props.class)">
    <slot />
  </h3>
</template>
