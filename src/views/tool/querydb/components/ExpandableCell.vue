<template>
  <div class="expandable-cell">
    <span v-if="!expanded">{{ truncatedContent }}</span>
    <span v-else>{{ content }}</span>
    <el-button v-if="shouldTruncate" link type="primary" @click="toggleExpand">
      {{ expanded ? '收起' : '展开' }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  maxLength: {
    type: Number,
    default: 50
  }
});

const expanded = ref(false);

const truncatedContent = computed(() => {
  if (props.content.length <= props.maxLength) {
    return props.content;
  }
  return props.content.slice(0, props.maxLength) + '...';
});

const shouldTruncate = computed(() => props.content.length > props.maxLength);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};
</script>

<style scoped>
.expandable-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.el-button {
  padding: 0;
  height: auto;
  margin-top: 4px;
}
</style>