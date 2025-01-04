<template>
    <v-container>
        <v-table>
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="name in parameterNames" :key="name"
                    :class="{ 'updated-parameter': parameters[name]?.updated }">
                    <td>{{ name }}</td>
                    <td>{{ parameters[name]?.value }}</td>
                    <td>{{ parameterStore.getParameterValue(name) }}</td>
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
