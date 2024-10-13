<template>
    <div ref="containerRef" class="rotary-knob" @mousedown="startDrag" @touchstart="startDrag">
        <canvas ref="canvas" :style="{ width: `${actualSize}px`, height: `${actualSize}px` }"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const props = withDefaults(defineProps<{
    modelValue: number;
    centerBased?: boolean;
    defaultValue?: number;
    colorIndex?: number;
    hasFocus?: boolean;
}>(), {
    centerBased: false,
    defaultValue: 0.5,
    colorIndex: 0,
    hasFocus: false
});

const colors = ['#A46C57', '#4397C7', '#E2AC5E', '#D33F5B', '#9269F6'];

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const size = ref(0);
const scale = ref(1);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);

const thickness = 3.5;
const startAngle = Math.PI * 3 / 4;
const endAngle = Math.PI * 9 / 4;

const actualSize = computed(() => Math.min(size.value, size.value));

const sensitivity = 0.005;

const setupCanvas = () => {
    if (!canvas.value || !containerRef.value) return;

    const rect = containerRef.value.getBoundingClientRect();
    size.value = Math.min(rect.width, rect.height);

    const dpr = window.devicePixelRatio || 1;
    scale.value = dpr;

    canvas.value.width = size.value * dpr;
    canvas.value.height = size.value * dpr;

    ctx.value = canvas.value.getContext('2d');
    if (ctx.value) {
        ctx.value.scale(dpr, dpr);
    }
};

const draw = () => {
    if (!ctx.value) return;

    const size = actualSize.value;
    ctx.value.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - thickness / 2;

    const angle = startAngle + props.modelValue * (endAngle - startAngle);

    // center circle
    ctx.value.beginPath();
    ctx.value.arc(centerX, centerY, radius * 0.85, 0, 2 * Math.PI);
    ctx.value.fillStyle = '#303030';
    ctx.value.fill();

    ctx.value.beginPath();
    ctx.value.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.value.fillStyle = colors[props.colorIndex];
    ctx.value.fill();

    if (!props.hasFocus) {
        ctx.value.beginPath();
        ctx.value.arc(centerX, centerY, radius * 0.6 - 5, 0, 2 * Math.PI);
        ctx.value.fillStyle = '#303030';
        ctx.value.fill();
    }
    // 背景の円弧
    ctx.value.beginPath();
    ctx.value.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.value.lineWidth = thickness;
    ctx.value.strokeStyle = '#666666';
    ctx.value.stroke();

    // 値の円弧
    ctx.value.beginPath();
    if (props.centerBased) {
        const midAngle = (startAngle + endAngle) / 2;
        if (angle > midAngle) {
            ctx.value.arc(centerX, centerY, radius, midAngle, angle);
        } else {
            ctx.value.arc(centerX, centerY, radius, angle, midAngle);
        }
    } else {
        ctx.value.arc(centerX, centerY, radius, startAngle, angle);
    }
    ctx.value.lineWidth = thickness;
    ctx.value.strokeStyle = colors[props.colorIndex];
    ctx.value.stroke();

    // マーカーの線
    const markerThickness = thickness;
    const markerStartDistance = radius * 0.65;
    const markerEndDistance = radius + thickness / 2;

    const markerStartX = centerX + markerStartDistance * Math.cos(angle);
    const markerStartY = centerY + markerStartDistance * Math.sin(angle);
    const markerEndX = centerX + markerEndDistance * Math.cos(angle);
    const markerEndY = centerY + markerEndDistance * Math.sin(angle);

    ctx.value.beginPath();
    ctx.value.moveTo(markerStartX, markerStartY);
    ctx.value.lineTo(markerEndX, markerEndY);
    ctx.value.lineWidth = markerThickness;
    ctx.value.strokeStyle = colors[props.colorIndex];
    ctx.value.stroke();
};

const startDrag = (event: MouseEvent | TouchEvent) => {
    isDragging.value = true;
    startY.value = 'touches' in event ? event.touches[0].clientY : event.clientY;
    startValue.value = props.modelValue;

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
};

const drag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;

    const currentY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaY = startY.value - currentY;
    const deltaValue = deltaY * sensitivity; // 感度を適用

    let newValue = startValue.value + deltaValue;
    newValue = Math.max(0, Math.min(1, newValue));

    emit('update:modelValue', newValue);
};

const endDrag = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    isDragging.value = false;
};

const handleDoubleClick = () => {
    emit('update:modelValue', props.defaultValue);
};

onMounted(() => {
    setupCanvas();
    draw();
    window.addEventListener('resize', setupCanvas);
});

onUnmounted(() => {
    window.removeEventListener('resize', setupCanvas);
});

watch(() => props.modelValue, () => {
    draw();
});

watch(() => actualSize.value, () => {
    setupCanvas();
    draw();
});
</script>

<style scoped>
.rotary-knob {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}
</style>