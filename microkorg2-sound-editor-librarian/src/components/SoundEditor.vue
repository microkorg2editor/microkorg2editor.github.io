<template>
    <h1>Sound Editor</h1>
    <div class="knob-container">
        <Mk2Knob v-model="knob1" class="knob" :color-index="0" :has-focus="true" />
        <Mk2Knob v-model="knob2" class="knob" :color-index="1" :has-focus="false" />
        <Mk2Knob v-model="knob3" class="knob" :color-index="2" :has-focus="false" />
        <Mk2Knob v-model="knob4" class="knob" :color-index="3" :has-focus="false" />
        <Mk2Knob v-model="knob5" class="knob" :color-index="4" :has-focus="false" />
    </div>
    <v-container>
        <h1>CC Parameters</h1>
        <div v-for="(param, index) in parameterList['CCParameters']" :key="index">
            {{ param.name }}
        </div>

        <h1>NRPN Parameters</h1>
        <div v-for="(param, index) in parameterList['NrpnParmeters']" :key="index">
            {{ param.name }}
        </div>
    </v-container>
</template>

<script setup>
import Mk2Knob from '@/components/Mk2Knob.vue';
import { ref } from 'vue';
import parameterList from '../../../parameterList.json';

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
