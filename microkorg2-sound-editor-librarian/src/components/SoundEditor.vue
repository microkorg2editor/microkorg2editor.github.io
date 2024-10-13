<template>
    <h1>Sound Editor</h1>
    <div class="knob-container">
        <mk2Knob v-model="knob1" class="knob" :color-index="0" :has-focus="true" />
        <mk2Knob v-model="knob2" class="knob" :color-index="1" :has-focus="false" />
        <mk2Knob v-model="knob3" class="knob" :color-index="2" :has-focus="false" />
        <mk2Knob v-model="knob4" class="knob" :color-index="3" :has-focus="false" />
        <mk2Knob v-model="knob5" class="knob" :color-index="4" :has-focus="false" />
    </div>
    <v-container>
        <div v-for="(param, index) in props.paramList" :key="index">
            {{ param.name }}
            <v-slider v-model="param.value" :min="param.min" :max="param.max" class="slider" />
        </div>
    </v-container>
</template>

<script setup>
import mk2Knob from '@/components/mk2Knob.vue';
import { ref } from 'vue';

const props = defineProps(['paramList']);
const knob1 = ref(0);
const knob2 = ref(0);
const knob3 = ref(0);
const knob4 = ref(0);
const knob5 = ref(0);
</script>

<style scoped>
.knob {
    width: 60px;
    height: 60px;
}

.slider {
    width: 50%;
}

.knob-container {
    display: flex;
    gap: 10px;
    flex-direction: row;
}
</style>
