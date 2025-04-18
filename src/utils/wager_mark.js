import useUserStore from '@/store/modules/user'
import {watch, ref} from 'vue'

// 创建一个变量来存储水印的可见状态
const watermarkVisible = ref(false)

export function addWatermark(enable = false) {
    // 设置水印可见状态
    watermarkVisible.value = enable
    const userStore = useUserStore()
    watch(() => [userStore.name, watermarkVisible.value], ([newName, visible]) => {
        console.log('userStore.name updated:', newName, 'watermark visible:', visible)
        const existing = document.getElementById('my-watermark')
        // 如果水印不可见，则移除现有水印并返回
        if (!visible) {
            if (existing) {
                existing.remove()
            }
            return
        }
        // 如果水印可见，继续创建或更新水印
        const target_mark = userStore.name ? userStore.name : "Sakura_k"
        if (existing) {
            existing.remove()
        }
        const watermark = document.createElement('div')
        watermark.id = 'my-watermark'
        watermark.className = 'global-watermark'
        document.body.appendChild(watermark)

        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 150
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save() // 保存当前状态（用于后面恢复）
        ctx.rotate((-20 * Math.PI) / 180)
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(180, 180, 180, 0.3)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(target_mark, 10, 70)
        ctx.restore() // 恢复到未旋转状态，防止后续绘图出错
        watermark.style.position = 'fixed'
        watermark.style.top = '0'
        watermark.style.left = '0'
        watermark.style.width = '100%'
        watermark.style.height = '100%'
        watermark.style.backgroundImage = `url(${canvas.toDataURL()})`
        watermark.style.pointerEvents = 'none'
        watermark.style.zIndex = '9999'
    }, {immediate: true})
}