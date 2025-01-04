<template>
    <v-container>
        <v-table>
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Slider</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="name in parameterNames" :key="name"
                    :class="{ 'updated-parameter': parameters[name]?.updated }">
                    <td>{{ name }}</td>
                    <td>{{ parameters[name]?.value }}</td>
                    <td>{{ parameterStore.getParameterValue(name) }}</td>
                    <td>
                        <input v-if="parameterStore.canSendCCorNRPN(name)" type="range" min="0" max="1" step="0.01"
                            :value="0.0" @input="parameterStore.setValue(name, $event.target.value)" />
                        <span v-else>-</span>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useParameterStore } from '@/stores/parameters';
import { storeToRefs } from 'pinia';

const parameterStore = useParameterStore();
const { parameters } = storeToRefs(parameterStore);
const parameterNames = computed(() => Object.keys(parameters.value));

const getCurrentProgram = () => {
    parameterStore.requestCurrentProgram();
};
</script>

<style scoped>
.updated-parameter {
    background-color: #4CAF50;
    transition: background-color 2s;
}
</style>
