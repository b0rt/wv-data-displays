<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { LogEntry } from '@/composables/useWebSocket'

const props = defineProps<{
  logs: LogEntry[]
}>()

const emit = defineEmits<{
  clear: []
}>()

const scrollRef = ref<HTMLDivElement | null>(null)

watch(() => props.logs.length, async () => {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
})
</script>

<template>
  <Card>
    <CardHeader class="flex-row items-center justify-between space-y-0">
      <CardTitle>Log</CardTitle>
      <Button variant="outline" size="sm" @click="emit('clear')">
        Leeren
      </Button>
    </CardHeader>
    <CardContent>
      <ScrollArea ref="scrollRef" class="h-36 rounded border border-border bg-muted/50 p-2">
        <div v-if="logs.length === 0" class="text-sm text-muted-foreground italic">
          Keine Aktivität
        </div>
        <div v-for="(entry, i) in logs" :key="i" class="text-xs py-0.5">
          <span class="text-primary mr-2">{{ entry.time }}</span>
          <span>{{ entry.message }}</span>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
