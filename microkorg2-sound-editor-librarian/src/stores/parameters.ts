import { defineStore } from "pinia";
import { microKORG2MidiAccessor } from "@/microKORG2MIDIAccessor";

interface Parameter {
  parameterNoStart: number;
  parameterNoEnd: number;
  name: string;
  value: number;
  updated: boolean;
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
      const setParameter = (
        parameterNoStart: number,
        parameterNoEnd: number,
        name: string
      ) => {
        this.parameters[name] = {
          parameterNoStart,
          parameterNoEnd,
          name,
          value: 0,
          updated: false
        };
      };

      const setOscParameterInfo = (
        timbreNo: number,
        oscNo: number,
        parameterNoStart: number
      ) => {};
      const setTimbreParameterInfo = (
        timbreNo: number,
        parameterNoStart: number
      ) => {
        const i = parameterNoStart;
        const t = `Timbre ${timbreNo + 1}`;
        setParameter(i + 0, i + 1, `${t} Level`);
        setParameter(i + 2, i + 3, `${t} Pan`);
        setParameter(i + 8, i + 9, `${t} Poly/Mono`);
        setParameter(i + 12, i + 13, `${t} Unison Number`);
        setParameter(i + 14, i + 15, `${t} Unison Detune`);
        setParameter(i + 16, i + 17, `${t} Unison Spread`);
        setParameter(i + 18, i + 19, `${t} Mod Type`);
        setParameter(i + 24, i + 25, `${t} Portamento Time`);
        setParameter(i + 26, i + 27, `${t} Portamento Mode`);
        setParameter(i + 28, i + 29, `${t} Transpose`);
        setParameter(i + 30, i + 31, `${t} Fine Tune`);
        setParameter(i + 32, i + 33, `${t} Pitch Bend Range`);
        setOscParameterInfo(timbreNo, 0, i + 40);
        setOscParameterInfo(timbreNo, 1, i + 64);
        setOscParameterInfo(timbreNo, 2, i + 88);
        setParameter(i + 112, i + 113, `${t} Noise Type`);
        setParameter(i + 114, i + 115, `${t} Noise Color`);
        setParameter(i + 116, i + 117, `${t} Noise Level`);
        setParameter(i + 128, i + 129, `${t} Filter Type`);
        setParameter(i + 130, i + 131, `${t} Filter Cutoff`);
        setParameter(i + 132, i + 133, `${t} Filter Resonance`);
        setParameter(i + 134, i + 135, `${t} Filter Keytrack`);
        setParameter(i + 136, i + 137, `${t} Filter Drive`);
        setParameter(i + 144, i + 145, `${t} Filter EG Attack`);
        setParameter(i + 146, i + 147, `${t} Filter EG Decay`);
        setParameter(i + 148, i + 151, `${t} Filter EG Sustain`);
        setParameter(i + 150, i + 151, `${t} Filter EG Release`);
        setParameter(i + 152, i + 153, `${t} Filter EG Intensity`);
        setParameter(i + 160, i + 161, `${t} AMP EG Attack`);
        setParameter(i + 162, i + 163, `${t} AMP EG Decay`);
        setParameter(i + 164, i + 165, `${t} AMP EG Sustain`);
        setParameter(i + 166, i + 167, `${t} AMP EG Release`);
        setParameter(i + 168, i + 169, `${t} AMP EG Intensity`);
        setParameter(i + 170, i + 171, `${t} AMP EG (Reserved)`);
        setParameter(i + 176, i + 177, `${t} LFO 1 Wave`);
        setParameter(i + 178, i + 179, `${t} LFO 1 Mode`);
        setParameter(i + 180, i + 181, `${t} LFO 1 Frequency`);
        setParameter(i + 182, i + 183, `${t} LFO 1 Sync Note`);
        setParameter(i + 184, i + 185, `${t} LFO 1 Key Sync`);
        setParameter(i + 200, i + 201, `${t} LFO 2 Wave`);
        setParameter(i + 202, i + 203, `${t} LFO 2 Mode`);
        setParameter(i + 204, i + 205, `${t} LFO 2 Frequency`);
        setParameter(i + 206, i + 207, `${t} LFO 2 Sync Note`);
        setParameter(i + 208, i + 209, `${t} LFO 2 Key Sync`);
        setParameter(i + 210, i + 211, `${t} LFO 2 Key Trigger`);
        setParameter(i + 212, i + 213, `${t} LFO 2 Delay`);
        for (let patchIndex = 0; patchIndex < 6; ++patchIndex) {
          setParameter(
            i + 214 + patchIndex * 16,
            i + 215 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Connect`
          );
          setParameter(
            i + 216 + patchIndex * 16,
            i + 217 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Source 1`
          );
          setParameter(
            i + 218 + patchIndex * 16,
            i + 219 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Source 2`
          );
          setParameter(
            i + 220 + patchIndex * 16,
            i + 221 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Dest`
          );
          setParameter(
            i + 222 + patchIndex * 16,
            i + 223 + patchIndex * 16,
            `${t} Patch ${patchIndex + 1} Intensity`
          );
        }
      };

      const setVocalProcessorParameterInfo = (parameterNoStart: number) => {};

      const setModEffectParameterInfo = (parameterNoStart: number) => {};

      const setDelayEffectParameterInfo = (parameterNoStart: number) => {};

      const setReverbEffectParameterInfo = (parameterNoStart: number) => {};

      setParameter(24, 25, "Timbre Mode");
      setParameter(26, 27, "Octave Shift");
      setParameter(36, 37, "Background Color");
      setParameter(42, 43, "AssignKnob1 Param");
      setParameter(50, 51, "AssignKnob2 Param");
      setParameter(58, 59, "AssignKnob3 Param");
      setParameter(66, 67, "AssignKnob4 Param");
      setParameter(74, 75, "AssignKnob5 Param");
      setTimbreParameterInfo(0, 104);
      setTimbreParameterInfo(1, 456);
      setParameter(808, 809, "Tempo");
      setParameter(810, 811, "Arp Off/On");
      setParameter(812, 813, "Latch");
      setParameter(814, 815, "Target");
      setParameter(816, 817, "Key Sync");
      setParameter(818, 819, "Type");
      setParameter(820, 821, "Octave Range");
      setParameter(822, 823, "Gate Time");
      setParameter(824, 825, "Resolution");
      setParameter(826, 827, "Swing");
      setParameter(828, 829, "Trigger Length");
      setParameter(840, 841, "Trigger Step 1");
      setParameter(842, 843, "Trigger Step 2");
      setParameter(844, 845, "Trigger Step 3");
      setParameter(846, 847, "Trigger Step 4");
      setParameter(848, 849, "Trigger Step 5");
      setParameter(850, 851, "Trigger Step 6");
      setParameter(852, 853, "Trigger Step 7");
      setParameter(854, 855, "Trigger Step 8");
      setVocalProcessorParameterInfo(856);
      setModEffectParameterInfo(1100);
      setDelayEffectParameterInfo(1164);
      setReverbEffectParameterInfo(1228);
      setParameter(1292, 1293, "Mic Routing");
      setParameter(1294, 1295, "Timbre 1 Routing");
      setParameter(1296, 1297, "Timbre 2 Routing");
      setParameter(1308, 1309, "EQ On/Off");
      setParameter(1310, 1311, "Low Freq");
      setParameter(1312, 1313, "High Freq");
      setParameter(1314, 1315, "Low Gain");
      setParameter(1316, 1317, "High Gain");
      setParameter(1318, 1319, "Feedback");
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
        this.parameters[name].value = value;
        this.parameters[name].updated = true;

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
  },

  getters: {
    getParameterValue: (state) => (name: string) => {
      return state.parameters[name]?.value ?? 0;
    },
    isUpdated: (state) => (name: string) => {
      return state.parameters[name]?.updated ?? false;
    },
  },
});
