<script setup lang="ts">
import { SafeArea, useSafeArea } from "@khm-studio/safearea/vue";
import "@khm-studio/safearea/css";
const state = useSafeArea();
</script>

<template>
  <SafeArea as="main" all>Visible height: {{ state.viewport.visibleHeight }}px</SafeArea>
</template>
