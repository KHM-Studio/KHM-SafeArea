<script setup lang="ts">
import { SafeArea, useSafeArea } from "@khm/safearea/vue";
import "@khm/safearea/css";
const state = useSafeArea();
</script>

<template>
  <SafeArea as="main" all>Visible height: {{ state.viewport.visibleHeight }}px</SafeArea>
</template>
