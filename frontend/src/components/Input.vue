<template>
    <div class="auto-input-container">
        <el-icon @click="handleSearch" class="search-icon">
            <Search />
        </el-icon>
        <input 
            @keyup.enter="handleSearch" 
            v-model="text" 
            type="text" 
            :placeholder="placeholder"
        >
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 定义 props
const props = defineProps({
    placeholder: {
        type: String,
        default: '关键词'
    }
})

// 定义 emits
const emit = defineEmits(['listener'])

// 响应式数据
const text = ref('')

// 方法
const handleSearch = () => {
    emit('listener', text.value)
}
</script>

<style scoped lang="scss">
.auto-input-container {
    padding: 6px 10px;
    border-radius: 5px;
    display: flex;
    min-width: 100px;
    border: 1px solid rgb(230, 230, 230);
    color: rgb(99, 98, 98);
    justify-content: left;
    box-sizing: border-box;
    align-items: center;
    background: #fff;

    input {
        outline: none;
        width: 90%;
        border: none;
        transition: all .5s ease;
        background: transparent;
        margin-left: 8px;
        
        &::placeholder {
            color: #c0c4cc;
        }
    }

    .search-icon {
        cursor: pointer;
        width: 16px;
        height: 16px;
        color: #909399;

        &:hover {
            color: #409EFF;
        }
    }
}
</style>