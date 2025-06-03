<template>
  <div class="expandable-cell">
    <div v-if="isJson" class="json-content">
      <pre v-if="expanded" class="json-formatted">{{ formattedJson }}</pre>
      <span v-else class="truncated-content">{{ truncatedContent }}</span>
      <el-button v-if="shouldTruncate" type="primary" link size="small" @click="toggleExpand">
        {{ expanded ? '收起' : '展开JSON' }}
      </el-button>
    </div>
    <div v-else class="text-content">
      <el-tooltip 
        v-if="shouldTruncate && !expanded" 
        :content="content" 
        placement="top" 
        :show-after="500"
        max-width="400"
      >
        <span class="truncated-content">{{ truncatedContent }}</span>
      </el-tooltip>
      <span v-else-if="expanded" class="expanded-content">{{ content }}</span>
      <span v-else class="normal-content">{{ content }}</span>
      
      <el-button v-if="shouldTruncate" type="primary" link size="small" @click="toggleExpand">
        {{ expanded ? '收起' : '展开' }}
      </el-button>
    </div>
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

// 检查内容是否为JSON
const isJson = computed(() => {
  if (!props.content) return false;
  
  try {
    const trimmedContent = props.content.trim();
    return (
      (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))
    ) && JSON.parse(props.content);
  } catch (e) {
    return false;
  }
});

// 格式化JSON
const formattedJson = computed(() => {
  if (!isJson.value) return props.content;
  
  try {
    return JSON.stringify(JSON.parse(props.content), null, 2);
  } catch (e) {
    return props.content;
  }
});

const truncatedContent = computed(() => {
  if (!props.content) return '';
  
  if (props.content.length <= props.maxLength) {
    return props.content;
  }
  return props.content.slice(0, props.maxLength) + '...';
});

const shouldTruncate = computed(() => props.content && props.content.length > props.maxLength);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};
</script>

<style scoped>
.expandable-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  position: relative;
}

.truncated-content {
  color: #606266;
  word-break: break-word;
}

.expanded-content {
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.normal-content {
  color: #303133;
  word-break: break-word;
}

.json-content {
  width: 100%;
}

.json-formatted {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  width: 100%;
  font-size: 12px;
  border: 1px solid #ebeef5;
}

.el-button {
  padding: 0;
  height: auto;
  margin-top: 4px;
  font-size: 12px;
}
</style>