import { defineStore } from "pinia";
import { microKORG2MidiAccessor } from "@/microKORG2MIDIAccessor";
import { parameterDescriptors, ParameterDescriptor } from "@/parameterDescriptor";

interface Parameter {
  parameterNoStart: number;
  parameterNoEnd: number;
  name: string;
  value: number;
  updated: boolean;
  getDescription: () => string;
}

interface ParameterState {
  parameters: { [key: string]: Parameter };
  midiAccessor: microKORG2MidiAccessor | null;
}

export const useParameterStore = defineStore("parameters", {
  state: (): ParameterState => ({
    parameters: {},
    midiAccessor: null,
  }),

  actions: {
    initialize() {
      this.initializeParameters();
      this.midiAccessor = new microKORG2MidiAccessor(this);
      this.midiAccessor.initMIDI();
    },

    initializeParameters() {
      const defineParameter = (
        parameterNoStart: number,
        parameterNoEnd: number,
        name: string,
        descriptor: ParameterDescriptor = parameterDescriptors.raw
      ) => {
        this.parameters[name] = {
          parameterNoStart,
          parameterNoEnd,
          name,
          value: 0,
          updated: false,
          getDescription: descriptor
        };
      };

      const defineOscParameter = (
        timbreNo: number,
        oscNo: number,
        parameterNoStart: number
      ) => {
        const name = `Timbre ${timbreNo + 1} Osc ${oscNo + 1}`;
        const i = parameterNoStart;
        defineParameter(i + 0, i + 1, `${name} Wave`);
        defineParameter(i + 2, i + 3, `${name} Wave Shape`);
        defineParameter(i + 4, i + 5, `${name} DWGS Sample`);
        defineParameter(i + 6, i + 7, `${name} OneShot Sample`);
        defineParameter(i + 8, i + 9, `${name} Level`);
        defineParameter(i + 10, i + 11, `${name} Mod Amount`);
        defineParameter(i + 12, i + 13, `${name} Semitones`);
        defineParameter(i + 14, i + 15, `${name} Fine Tune`);
        defineParameter(i + 16, i + 17, `${name} Keytrack`);
      };
      const setTimbreParameterInfo = (
        timbreNo: number,
        parameterNoStart: number
      ) => {
        const i = parameterNoStart;
        const t = `Timbre ${timbreNo + 1}`;
        defineParameter(i + 0, i + 1, `${t} Level`);
        defineParameter(i + 2, i + 3, `${t} Pan`, parameterDescriptors.signedTwoByte);
        defineParameter(i + 8, i + 9, `${t} Poly/Mono`);
        defineParameter(i + 12, i + 13, `${t} Unison Number`);
        defineParameter(i + 14, i + 15, `${t} Unison Detune`);
        defineParameter(i + 16, i + 17, `${t} Unison Spread`);
        defineParameter(i + 18, i + 19, `${t} Mod Type`);
        defineParameter(i + 24, i + 25, `${t} Portamento Time`);
        defineParameter(i + 26, i + 27, `${t} Portamento Mode`);
        defineParameter(i + 28, i + 29, `${t} Transpose`);
        defineParameter(i + 30, i + 31, `${t} Fine Tune`);
        defineParameter(i + 32, i + 33, `${t} Pitch Bend Range`);
        defineOscParameter(timbreNo, 0, i + 40);
        defineOscParameter(timbreNo, 1, i + 64);
        defineOscParameter(timbreNo, 2, i + 88);
        defineParameter(i + 112, i + 113, `${t} Noise Type`);
        defineParameter(i + 114, i + 115, `${t} Noise Color`);
        defineParameter(i + 116, i + 117, `${t} Noise Level`);
        defineParameter(i + 128, i + 129, `${t} Filter Type`);
        defineParameter(i + 130, i + 131, `${t} Filter Cutoff`);
        defineParameter(i + 132, i + 133, `${t} Filter Resonance`);
        defineParameter(i + 134, i + 135, `${t} Filter Keytrack`);
        defineParameter(i + 136, i + 137, `${t} Filter Drive`);
        defineParameter(i + 144, i + 145, `${t} Filter EG Attack`);
        defineParameter(i + 146, i + 147, `${t} Filter EG Decay`);
        defineParameter(i + 148, i + 151, `${t} Filter EG Sustain`);
        defineParameter(i + 150, i + 151, `${t} Filter EG Release`);
        defineParameter(i + 152, i + 153, `${t} Filter EG Intensity`);
        defineParameter(i + 160, i + 161, `${t} AMP EG Attack`);
        defineParameter(i + 162, i + 163, `${t} AMP EG Decay`);
        defineParameter(i + 164, i + 165, `${t} AMP EG Sustain`);
        defineParameter(i + 166, i + 167, `${t} AMP EG Release`);
        defineParameter(i + 168, i + 169, `${t} AMP EG Intensity`);
        defineParameter(i + 170, i + 171, `${t} AMP EG (Reserved)`);
        defineParameter(i + 176, i + 177, `${t} LFO 1 Wave`);
        defineParameter(i + 178, i + 179, `${t} LFO 1 Mode`);
        defineParameter(i + 180, i + 181, `${t} LFO 1 Frequency`);
        defineParameter(i + 182, i + 183, `${t} LFO 1 Sync Note`);
        defineParameter(i + 184, i + 185, `${t} LFO 1 Key Sync`);
        defineParameter(i + 200, i + 201, `${t} LFO 2 Wave`);
        defineParameter(i + 202, i + 203, `${t} LFO 2 Mode`);
        defineParameter(i + 204, i + 205, `${t} LFO 2 Frequency`);
        defineParameter(i + 206, i + 207, `${t} LFO 2 Sync Note`);
        defineParameter(i + 208, i + 209, `${t} LFO 2 Key Sync`);
        defineParameter(i + 210, i + 211, `${t} LFO 2 Key Trigger`);
        defineParameter(i + 212, i + 213, `${t} LFO 2 Delay`);
        for (let patchIndex = 0; patchIndex < 6; ++patchIndex) {
          defineParameter(
            i + 214 + patchIndex * 16,
            i + 215 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Connect`
          );
          defineParameter(
            i + 216 + patchIndex * 16,
            i + 217 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Source 1`
          );
          defineParameter(
            i + 218 + patchIndex * 16,
            i + 219 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Source 2`
          );
          defineParameter(
            i + 220 + patchIndex * 16,
            i + 221 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Dest`
          );
          defineParameter(
            i + 222 + patchIndex * 16,
            i + 223 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Intensity`
          );
        }
      };

      const setVocalProcessorParameterInfo = (parameterNoStart: number) => {
        const i = parameterNoStart;
        const v = `Vocal Processor`;
        defineParameter(i + 0, i + 1, `${v} Scale/KBD`);
        defineParameter(i + 2, i + 3, `${v} Scale Key`);
        defineParameter(i + 4, i + 5, `${v} Scale Type`);
        defineParameter(i + 6, i + 15, `${v} (dummy bytes)`);
        defineParameter(i + 16, i + 17, `${v} Vocoder Off/On`);
        defineParameter(i + 18, i + 19, `${v} Mic Direct`);
        defineParameter(i + 20, i + 21, `${v} Synth Dry/Wet`);
        defineParameter(i + 22, i + 23, `${v} Formant`);
        defineParameter(i + 24, i + 25, `${v} E.F.Sens`);
        defineParameter(i + 26, i + 29, `${v} (dummy bytes)`);
        defineParameter(i + 30, i + 31, `${v} (Reserved)`);
        for (let bandIndex = 0; bandIndex < 16; ++bandIndex) {
          defineParameter(
            i + 32 + bandIndex * 2,
            i + 33 + bandIndex * 2,
            `${v} Band ${bandIndex + 1} Level`
          );
          defineParameter(
            i + 64 + bandIndex * 2,
            i + 65 + bandIndex * 2,
            `${v} Band ${bandIndex + 1} Pan`
          );
          defineParameter(
            i + 96 + bandIndex * 2,
            i + 97 + bandIndex * 2,
            `${v} Band ${bandIndex + 1} (dummy bytes)`
          );
        }
        defineParameter(i + 128, i + 129, `${v} Hardtune Off/On`);
        defineParameter(i + 130, i + 131, `${v} Intensity`);
        defineParameter(i + 132, i + 133, `${v} Speed`);
        defineParameter(i + 134, i + 135, `${v} Formant`);

        defineParameter(i + 144, i + 145, `${v} Harmonizer Off/On`);
        defineParameter(i + 146, i + 147, `${v} Harmony Number`);
        defineParameter(i + 148, i + 149, `${v} Harmonies Level`);
        defineParameter(i + 150, i + 151, `${v} Stereo`);
        defineParameter(i + 152, i + 153, `${v} Formant`);
        defineParameter(i + 154, i + 155, `${v} Pitch Detune`);
        defineParameter(i + 156, i + 157, `${v} Delay`);
        for (let pitchIndex = 0; pitchIndex < 3; ++pitchIndex) {
          defineParameter(i + 196 + pitchIndex * 2, i + 197 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Natural`);
          defineParameter(i + 198 + pitchIndex * 2, i + 199 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Penta`);
          defineParameter(i + 200 + pitchIndex * 2, i + 201 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Blues`);
          defineParameter(i + 202 + pitchIndex * 2, i + 203 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Raga`);
          defineParameter(i + 206 + pitchIndex * 2, i + 207 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Fourths`);
          defineParameter(i + 208 + pitchIndex * 2, i + 209 + pitchIndex * 2, `${v} Pitch ${pitchIndex + 1} Fifths`);
        }
      };

      const defineModEffectParameter = (parameterNoStart: number) => { };

      const defineDelayEffectParameter = (parameterNoStart: number) => { };

      const defineReverbEffectParameter = (parameterNoStart: number) => { };

      defineParameter(24, 25, "Timbre Mode", parameterDescriptors.singleDual);
      defineParameter(26, 27, "Octave Shift", parameterDescriptors.signedTwoByte);
      defineParameter(36, 37, "Background Color", parameterDescriptors.raw);
      defineParameter(42, 43, "AssignKnob1 Param", parameterDescriptors.assignKnob);
      defineParameter(50, 51, "AssignKnob2 Param", parameterDescriptors.assignKnob);
      defineParameter(58, 59, "AssignKnob3 Param", parameterDescriptors.assignKnob);
      defineParameter(66, 67, "AssignKnob4 Param", parameterDescriptors.assignKnob);
      defineParameter(74, 75, "AssignKnob5 Param", parameterDescriptors.assignKnob);
      setTimbreParameterInfo(0, 104);
      setTimbreParameterInfo(1, 456);
      defineParameter(808, 809, "Tempo");
      defineParameter(810, 811, "Arp Off/On");
      defineParameter(812, 813, "Latch");
      defineParameter(814, 815, "Target");
      defineParameter(816, 817, "Key Sync");
      defineParameter(818, 819, "Type");
      defineParameter(820, 821, "Octave Range");
      defineParameter(822, 823, "Gate Time");
      defineParameter(824, 825, "Resolution");
      defineParameter(826, 827, "Swing");
      defineParameter(828, 829, "Trigger Length");
      defineParameter(840, 841, "Trigger Step 1");
      defineParameter(842, 843, "Trigger Step 2");
      defineParameter(844, 845, "Trigger Step 3");
      defineParameter(846, 847, "Trigger Step 4");
      defineParameter(848, 849, "Trigger Step 5");
      defineParameter(850, 851, "Trigger Step 6");
      defineParameter(852, 853, "Trigger Step 7");
      defineParameter(854, 855, "Trigger Step 8");
      setVocalProcessorParameterInfo(856);
      defineModEffectParameter(1100);
      defineDelayEffectParameter(1164);
      defineReverbEffectParameter(1228);
      defineParameter(1292, 1293, "Mic Routing");
      defineParameter(1294, 1295, "Timbre 1 Routing");
      defineParameter(1296, 1297, "Timbre 2 Routing");
      defineParameter(1308, 1309, "EQ On/Off");
      defineParameter(1310, 1311, "Low Freq");
      defineParameter(1312, 1313, "High Freq");
      defineParameter(1314, 1315, "Low Gain");
      defineParameter(1316, 1317, "High Gain");
      defineParameter(1318, 1319, "Feedback");
    },

    setValueFromDump(dump: Uint8Array) {
      let data = this.expandDumpData(dump);

      Object.values(this.parameters).forEach((param) => {
        let value = 0;
        for (
          let index = param.parameterNoStart;
          index <= param.parameterNoEnd;
          ++index
        ) {
          value |= data[index] << ((index - param.parameterNoStart) * 8);
        }
        this.updateParameter(param.name, value);
      });
    },

    expandDumpData(dump: Uint8Array): Uint8Array {
      let r = 0,
        w = 0;
      let data = new Uint8Array(1324);

      while (r < dump.length) {
        data[w + 0] = dump[r + 1] | (((dump[r + 0] >> 0) & 1) << 7);
        data[w + 1] = dump[r + 2] | (((dump[r + 0] >> 1) & 1) << 7);
        data[w + 2] = dump[r + 3] | (((dump[r + 0] >> 2) & 1) << 7);
        data[w + 3] = dump[r + 4] | (((dump[r + 0] >> 3) & 1) << 7);
        data[w + 4] = dump[r + 5] | (((dump[r + 0] >> 4) & 1) << 7);
        data[w + 5] = dump[r + 6] | (((dump[r + 0] >> 5) & 1) << 7);
        data[w + 6] = dump[r + 7] | (((dump[r + 0] >> 6) & 1) << 7);
        r += 8;
        w += 7;
      }
      return data;
    },

    updateParameter(name: string, value: number) {
      if (this.parameters[name]) {
        this.parameters[name].updated = this.parameters[name].value != value;
        this.parameters[name].value = value;

        setTimeout(() => {
          if (this.parameters[name]) {
            this.parameters[name].updated = false;
          }
        }, 2000);
      }
    },

    requestCurrentProgram() {
      this.midiAccessor?.sendProgramDataDumpRequest();
    },

    getAllParameterNames(): string[] {
      return Object.keys(this.parameters);
    },

    getParameterValue(name: string): string {
      return this.parameters[name]?.getDescription(this.parameters[name]?.value) ?? "???";
    }
  },

  getters: {
    isUpdated: (state) => (name: string) => {
      return state.parameters[name]?.updated ?? false;
    },
  },
});
