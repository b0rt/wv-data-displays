<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Client } from '@/composables/useWebSocket'

const props = defineProps<{
  clients: Client[]
  selectedTarget: number | 'all'
}>()

const emit = defineEmits<{
  'update:selectedTarget': [value: number | 'all']
}>()

const targetLabel = computed(() => {
  if (props.selectedTarget === 'all') {
    return `→ Alle ${props.clients.length} Displays`
  }
  const client = props.clients.find(c => c.id === props.selectedTarget)
  return `→ ${client ? client.name : 'Display #' + props.selectedTarget}`
})

function selectClient(id: number) {
  emit('update:selectedTarget', props.selectedTarget === id ? 'all' : id)
}

function selectAll() {
  emit('update:selectedTarget', 'all')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <h2 class="text-xs uppercase tracking-widest text-muted-foreground mb-4">
      Verbundene Displays
    </h2>

    <Button
      :variant="selectedTarget === 'all' ? 'default' : 'outline'"
      class="w-full mb-2 justify-start"
      @click="selectAll"
    >
      ✦ Alle Displays
    </Button>

    <ScrollArea class="flex-1 -mx-2 px-2">
      <div v-if="clients.length === 0" class="text-center text-muted-foreground text-sm py-8 italic">
        Warte auf Verbindungen...
      </div>
      <div v-else class="space-y-2">
        <button
          v-for="client in clients"
          :key="client.id"
          class="w-full p-3 rounded-md border text-left transition-all hover:border-primary"
          :class="selectedTarget === client.id ? 'border-primary bg-primary/10' : 'border-border'"
          @click="selectClient(client.id)"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm">💻 {{ client.name }}</span>
            <span class="text-xs text-muted-foreground">#{{ client.id }}</span>
          </div>
        </button>
      </div>
    </ScrollArea>

    <div class="mt-4 pt-4 border-t border-border">
      <Badge :variant="selectedTarget === 'all' ? 'default' : 'secondary'">
        {{ targetLabel }}
      </Badge>
    </div>
  </div>
</template>
