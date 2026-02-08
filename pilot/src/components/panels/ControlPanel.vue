<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  selectedTarget: number | 'all'
}>()

const emit = defineEmits<{
  send: [msg: Record<string, unknown>]
  log: [message: string]
}>()

function clearDisplays() {
  emit('send', {
    type: 'clear',
    target: props.selectedTarget,
    style: 'fade',
  })
  emit('log', 'Displays geleert')
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Steuerung</CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="destructive" @click="clearDisplays">
        🗑 Alles löschen
      </Button>
    </CardContent>
  </Card>
</template>
