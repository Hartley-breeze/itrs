<template>
    <div class="sliding-button-group">
        <div class="buttons-container">
            <button 
                v-for="(button, index) in props.buttons" 
                :key="index" 
                :class="{ active: activeValue === button.value }"
                @click="selectButton(button)"
            >
                {{ button.label }}
            </button>
            <div class="slider" :style="sliderStyle"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 定义 props
const props = defineProps({
    buttons: {
        type: Array,
        default: () => [],
        validator: buttons => buttons.every(b => 'value' in b && 'label' in b)
    },
    initialActive: {
        type: [Number, String],
        default: null
    }
})

// 定义 emits
const emit = defineEmits(['change'])

// 响应式数据
const activeValue = ref(props.initialActive)

// 计算属性
const activeButtonIndex = computed(() => {
    return props.buttons.findIndex(b => b.value === activeValue.value)
})

const sliderStyle = computed(() => {
    if (props.buttons.length === 0) return {}

    return {
        width: `${100 / props.buttons.length}%`,
        transform: `translateX(${activeButtonIndex.value * 100}%)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' // 更平滑的缓动函数
    }
})

// 方法
const selectButton = (button) => {
    if (activeValue.value !== button.value) {
        activeValue.value = button.value
        emit('change', button)
    }
}

// 监听 initialActive 的变化
watch(() => props.initialActive, (newVal) => {
    activeValue.value = newVal
})
</script>

<style scoped>
.sliding-button-group {
    border: 1px solid rgb(230, 230, 230);
    padding: 2px;
    border-radius: 16px;
    display: inline-block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: rgb(242,242,242);
}

.buttons-container {
    position: relative;
    display: flex;
    border-radius: 8px;
    padding: 2px;
    overflow: hidden;
}

button {
    flex: 1;
    min-width: 80px;
    padding: 2px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    position: relative;
    z-index: 1;
    transition: color 0.3s ease;
    text-align: center;
    font-weight: 500;
}

button.active {
    color: #333;
    font-weight: 600;
}

.slider {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgb(255,255,255);
    border-radius: 12px;
    z-index: 0;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停效果 */
button:hover {
    color: #333;
}

/* 确保激活状态的文字在滑块上方 */
button.active {
    position: relative;
    z-index: 2;
}
</style>