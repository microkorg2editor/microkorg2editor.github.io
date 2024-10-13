<template>
    <v-app>
        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>microKORG2 Sound Editor/Librarian</v-toolbar-title>
            <v-btn @click="midiSettingsDialog = true">
                <v-icon>mdi-midi-port</v-icon>
                MIDI Settings
            </v-btn>

            <v-btn @click="qrCodeReaderDialog = true">
                <v-icon>mdi-qrcode</v-icon>
                QR Code Reader
            </v-btn>

            <v-btn-toggle v-model="view" class="mr-2">
                <v-btn value="editor">
                    <v-icon>mdi-pencil</v-icon>
                    Editor
                </v-btn>
                <v-btn value="librarian">
                    <v-icon>mdi-library</v-icon>
                    Librarian
                </v-btn>
            </v-btn-toggle>
        </v-app-bar>

        <v-main>
            <SoundLibrarian v-if="view === 'librarian'" />
            <SoundEditor v-else-if="view === 'editor'" />
        </v-main>

        <v-navigation-drawer v-model="drawer" absolute temporary>
            <v-list>
                <v-list-item @click="aboutDialog = true">About</v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-dialog v-model="aboutDialog" max-width="500">
            <v-card>
                <v-card-title>About</v-card-title>
                <v-card-text>
                    microKORG2 Sound Editor/Librarian v0.0.1
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="midiSettingsDialog" max-width="500">
            <v-card>
                <v-card-title>MIDI Settings</v-card-title>
                <v-card-text>
                    <v-select v-model="selectedMidiIn" :items="midiIn" label="MIDI In" class="w-2 ma-2"></v-select>
                    <v-select v-model="selectedMidiOut" :items="midiOut" label="MIDI Out" class="w-2 ma-2"></v-select>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="qrCodeReaderDialog" max-width="500">
            <v-card>
                <v-card-title>QR Code Reader</v-card-title>
                <v-card-text>
                    <qrcode-stream @detect="onDetect"></qrcode-stream>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="qrCodeReaderDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="qrCodeResultDialog" max-width="500">
            <v-card>
                <v-card-title>QR Content</v-card-title>
                <v-card-text>{{ qrCodeContent }}</v-card-text>
            </v-card>
            <v-card-actions>
                <v-btn color="primary" @click="qrCodeResultDialog = false">Close</v-btn>
            </v-card-actions>
        </v-dialog>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import SoundLibrarian from '@/components/SoundLibrarian.vue';
import SoundEditor from '@/components/SoundEditor.vue';
import { connect, loadJSON, sendMidiCC, sliderChange, createTable, midiIn, midiOut, notesOn, mParameterData } from '../../app.js';
import { QrcodeStream } from 'vue-qrcode-reader';

const drawer = ref(false);
const view = ref('editor');
const aboutDialog = ref(false);
const midiSettingsDialog = ref(false);
const selectedMidiIn = ref(midiIn[0]);
const selectedMidiOut = ref(midiOut[0]);
const qrCodeReaderDialog = ref(false);
const qrCodeResultDialog = ref(false);
const qrCodeContent = ref('');

const onDetect = (content) => {
    qrCodeContent.value = content;
    qrCodeResultDialog.value = true;
    qrCodeReaderDialog.value = false;
};
</script>
