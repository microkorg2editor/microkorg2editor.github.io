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
  cc?: {
    number: number;
    min: number;
    max: number;
  };
  nrpn?: {
    msb: number;
    lsb: number;
    min: number;
    max: number;
  };
}

interface ParameterState {
  parameters: { [key: string]: Parameter };
  midiAccessor: microKORG2MidiAccessor | null;
}

interface CCParameter {
  number: number;
  min?: number;
  max?: number;
}

interface ParameterDefinition {
  parameterNoStart: number;
  parameterNoEnd: number;
  name: string;
  descriptor?: ParameterDescriptor;
  cc?: number | CCParameter;
  nrpn?: {
    msb: number;
    lsb: number;
    min?: number;
    max?: number;
  };
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
      const defineParameter = (def: ParameterDefinition) => {
        const cc = typeof def.cc === 'number'
          ? { number: def.cc, min: 0, max: 0x7F }
          : def.cc && {
            number: def.cc.number,
            min: def.cc.min ?? 0,
            max: def.cc.max ?? 0x7F
          };

        const nrpn = def.nrpn && {
          ...def.nrpn,
          min: def.nrpn.min ?? 0,
          max: def.nrpn.max ?? 0x7F
        };

        this.parameters[def.name] = {
          parameterNoStart: def.parameterNoStart,
          parameterNoEnd: def.parameterNoEnd,
          name: def.name,
          value: 0,
          updated: false,
          getDescription: def.descriptor ?? parameterDescriptors.raw,
          cc,
          nrpn
        };
      };

      const defineOscParameter = (
        timbreNo: number,
        oscNo: number,
        parameterNoStart: number
      ) => {
        const name = `Timbre ${timbreNo + 1} Osc ${oscNo + 1}`;
        const i = parameterNoStart;
        defineParameter({
          parameterNoStart: i + 0,
          parameterNoEnd: i + 1,
          name: `${name} Wave`,
          descriptor: parameterDescriptors.raw,
          cc: 0x08
        });
        defineParameter({
          parameterNoStart: i + 2,
          parameterNoEnd: i + 3,
          name: `${name} Wave Shape`,
          descriptor: parameterDescriptors.raw,
          cc: 0x09
        });
        defineParameter({
          parameterNoStart: i + 4,
          parameterNoEnd: i + 5,
          name: `${name} DWGS Sample`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 6,
          parameterNoEnd: i + 7,
          name: `${name} OneShot Sample`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 8,
          parameterNoEnd: i + 9,
          name: `${name} Level`,
          descriptor: parameterDescriptors.raw,
          cc: 0x17 + oscNo
        });
        defineParameter({
          parameterNoStart: i + 10,
          parameterNoEnd: i + 11,
          name: `${name} Mod Amount`,
          descriptor: parameterDescriptors.raw,
          cc: (oscNo === 0) ? 0x0f : (oscNo === 1) ? 0x14 : undefined
        });
        defineParameter({
          parameterNoStart: i + 12,
          parameterNoEnd: i + 13,
          name: `${name} Semitones`,
          descriptor: parameterDescriptors.raw,
          cc: (oscNo === 0) ? 0x10 : (oscNo === 1) ? 0x15 : (oscNo === 2) ? 0x33 : undefined
        });
        defineParameter({
          parameterNoStart: i + 14,
          parameterNoEnd: i + 15,
          name: `${name} Fine Tune`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 16,
          parameterNoEnd: i + 17,
          name: `${name} Keytrack`,
          descriptor: parameterDescriptors.raw
        });
      };
      const setTimbreParameterInfo = (
        timbreNo: number,
        parameterNoStart: number
      ) => {
        const i = parameterNoStart;
        const t = `Timbre ${timbreNo + 1}`;
        defineParameter({
          parameterNoStart: i + 0,
          parameterNoEnd: i + 1,
          name: `${t} Level`,
          descriptor: parameterDescriptors.raw,
          cc: 7
        });
        defineParameter({
          parameterNoStart: i + 2,
          parameterNoEnd: i + 3,
          name: `${t} Pan`,
          descriptor: parameterDescriptors.signedTwoByte,
          cc: 10
        });
        defineParameter({
          parameterNoStart: i + 8,
          parameterNoEnd: i + 9,
          name: `${t} Poly/Mono`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 12,
          parameterNoEnd: i + 13,
          name: `${t} Unison Number`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 14,
          parameterNoEnd: i + 15,
          name: `${t} Unison Detune`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 16,
          parameterNoEnd: i + 17,
          name: `${t} Unison Spread`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 18,
          parameterNoEnd: i + 19,
          name: `${t} Mod Type`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 24,
          parameterNoEnd: i + 25,
          name: `${t} Portamento Time`,
          descriptor: parameterDescriptors.raw,
          cc: 5
        });
        defineParameter({
          parameterNoStart: i + 26,
          parameterNoEnd: i + 27,
          name: `${t} Portamento Mode`,
          descriptor: parameterDescriptors.raw,
          cc: 65
        });
        defineParameter({
          parameterNoStart: i + 28,
          parameterNoEnd: i + 29,
          name: `${t} Transpose`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 30,
          parameterNoEnd: i + 31,
          name: `${t} Fine Tune`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 32,
          parameterNoEnd: i + 33,
          name: `${t} Pitch Bend Range`,
          descriptor: parameterDescriptors.raw
        });
        defineOscParameter(timbreNo, 0, i + 40);
        defineOscParameter(timbreNo, 1, i + 64);
        defineOscParameter(timbreNo, 2, i + 88);
        defineParameter({
          parameterNoStart: i + 112,
          parameterNoEnd: i + 113,
          name: `${t} Noise Type`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 114,
          parameterNoEnd: i + 115,
          name: `${t} Noise Color`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 116,
          parameterNoEnd: i + 117,
          name: `${t} Noise Level`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 128,
          parameterNoEnd: i + 129,
          name: `${t} Filter Type`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 130,
          parameterNoEnd: i + 131,
          name: `${t} Filter Cutoff`,
          descriptor: parameterDescriptors.raw,
          cc: 74
        });
        defineParameter({
          parameterNoStart: i + 132,
          parameterNoEnd: i + 133,
          name: `${t} Filter Resonance`,
          descriptor: parameterDescriptors.raw,
          cc: 71
        });
        defineParameter({
          parameterNoStart: i + 134,
          parameterNoEnd: i + 135,
          name: `${t} Filter Keytrack`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 136,
          parameterNoEnd: i + 137,
          name: `${t} Filter Drive`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 144,
          parameterNoEnd: i + 145,
          name: `${t} Filter EG Attack`,
          descriptor: parameterDescriptors.raw,
          cc: 73
        });
        defineParameter({
          parameterNoStart: i + 146,
          parameterNoEnd: i + 147,
          name: `${t} Filter EG Decay`,
          descriptor: parameterDescriptors.raw,
          cc: 75
        });
        defineParameter({
          parameterNoStart: i + 148,
          parameterNoEnd: i + 151,
          name: `${t} Filter EG Sustain`,
          descriptor: parameterDescriptors.raw,
          cc: 70
        });
        defineParameter({
          parameterNoStart: i + 150,
          parameterNoEnd: i + 151,
          name: `${t} Filter EG Release`,
          descriptor: parameterDescriptors.raw,
          cc: 72
        });
        defineParameter({
          parameterNoStart: i + 152,
          parameterNoEnd: i + 153,
          name: `${t} Filter EG Intensity`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 160,
          parameterNoEnd: i + 161,
          name: `${t} AMP EG Attack`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 162,
          parameterNoEnd: i + 163,
          name: `${t} AMP EG Decay`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 164,
          parameterNoEnd: i + 165,
          name: `${t} AMP EG Sustain`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 166,
          parameterNoEnd: i + 167,
          name: `${t} AMP EG Release`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 168,
          parameterNoEnd: i + 169,
          name: `${t} AMP EG Intensity`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 170,
          parameterNoEnd: i + 171,
          name: `${t} AMP EG (Reserved)`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 176,
          parameterNoEnd: i + 177,
          name: `${t} LFO 1 Wave`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 178,
          parameterNoEnd: i + 179,
          name: `${t} LFO 1 Mode`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 180,
          parameterNoEnd: i + 181,
          name: `${t} LFO 1 Frequency`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 182,
          parameterNoEnd: i + 183,
          name: `${t} LFO 1 Sync Note`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 184,
          parameterNoEnd: i + 185,
          name: `${t} LFO 1 Key Sync`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 200,
          parameterNoEnd: i + 201,
          name: `${t} LFO 2 Wave`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 202,
          parameterNoEnd: i + 203,
          name: `${t} LFO 2 Mode`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 204,
          parameterNoEnd: i + 205,
          name: `${t} LFO 2 Frequency`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 206,
          parameterNoEnd: i + 207,
          name: `${t} LFO 2 Sync Note`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 208,
          parameterNoEnd: i + 209,
          name: `${t} LFO 2 Key Sync`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 210,
          parameterNoEnd: i + 211,
          name: `${t} LFO 2 Key Trigger`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 212,
          parameterNoEnd: i + 213,
          name: `${t} LFO 2 Delay`,
          descriptor: parameterDescriptors.raw
        });
        for (let patchIndex = 0; patchIndex < 6; ++patchIndex) {
          defineParameter({
            parameterNoStart: i + 214 + patchIndex * 16,
            parameterNoEnd: i + 215 + patchIndex * 16,
            name: `${t} Patch ${patchIndex + 1} Connect`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 216 + patchIndex * 16,
            parameterNoEnd: i + 217 + patchIndex * 16,
            name: `${t} Patch ${patchIndex + 1} Source 1`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 218 + patchIndex * 16,
            parameterNoEnd: i + 219 + patchIndex * 16,
            name: `${t} Patch ${patchIndex + 1} Source 2`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 220 + patchIndex * 16,
            parameterNoEnd: i + 221 + patchIndex * 16,
            name: `${t} Patch ${patchIndex + 1} Dest`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 222 + patchIndex * 16,
            parameterNoEnd: i + 223 + patchIndex * 16,
            name: `${t} Patch ${patchIndex + 1} Intensity`,
            descriptor: parameterDescriptors.raw
          });
        }
      };

      const setVocalProcessorParameterInfo = (parameterNoStart: number) => {
        const i = parameterNoStart;
        const v = `Vocal Processor`;
        defineParameter({
          parameterNoStart: i + 0,
          parameterNoEnd: i + 1,
          name: `${v} Scale/KBD`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 2,
          parameterNoEnd: i + 3,
          name: `${v} Scale Key`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 4,
          parameterNoEnd: i + 5,
          name: `${v} Scale Type`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 6,
          parameterNoEnd: i + 15,
          name: `${v} (dummy bytes)`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 16,
          parameterNoEnd: i + 17,
          name: `${v} Vocoder Off/On`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 18,
          parameterNoEnd: i + 19,
          name: `${v} Mic Direct`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 20,
          parameterNoEnd: i + 21,
          name: `${v} Synth Dry/Wet`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 22,
          parameterNoEnd: i + 23,
          name: `${v} Formant`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 24,
          parameterNoEnd: i + 25,
          name: `${v} E.F.Sens`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 26,
          parameterNoEnd: i + 29,
          name: `${v} (dummy bytes)`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 30,
          parameterNoEnd: i + 31,
          name: `${v} (Reserved)`,
          descriptor: parameterDescriptors.raw
        });
        for (let bandIndex = 0; bandIndex < 16; ++bandIndex) {
          defineParameter({
            parameterNoStart: i + 32 + bandIndex * 2,
            parameterNoEnd: i + 33 + bandIndex * 2,
            name: `${v} Band ${bandIndex + 1} Level`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 64 + bandIndex * 2,
            parameterNoEnd: i + 65 + bandIndex * 2,
            name: `${v} Band ${bandIndex + 1} Pan`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 96 + bandIndex * 2,
            parameterNoEnd: i + 97 + bandIndex * 2,
            name: `${v} Band ${bandIndex + 1} (dummy bytes)`,
            descriptor: parameterDescriptors.raw
          });
        }
        defineParameter({
          parameterNoStart: i + 128,
          parameterNoEnd: i + 129,
          name: `${v} Hardtune Off/On`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 130,
          parameterNoEnd: i + 131,
          name: `${v} Intensity`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 132,
          parameterNoEnd: i + 133,
          name: `${v} Speed`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 134,
          parameterNoEnd: i + 135,
          name: `${v} Formant`,
          descriptor: parameterDescriptors.raw
        });

        defineParameter({
          parameterNoStart: i + 144,
          parameterNoEnd: i + 145,
          name: `${v} Harmonizer Off/On`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 146,
          parameterNoEnd: i + 147,
          name: `${v} Harmony Number`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 148,
          parameterNoEnd: i + 149,
          name: `${v} Harmonies Level`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 150,
          parameterNoEnd: i + 151,
          name: `${v} Stereo`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 152,
          parameterNoEnd: i + 153,
          name: `${v} Formant`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 154,
          parameterNoEnd: i + 155,
          name: `${v} Pitch Detune`,
          descriptor: parameterDescriptors.raw
        });
        defineParameter({
          parameterNoStart: i + 156,
          parameterNoEnd: i + 157,
          name: `${v} Delay`,
          descriptor: parameterDescriptors.raw
        });
        for (let pitchIndex = 0; pitchIndex < 3; ++pitchIndex) {
          defineParameter({
            parameterNoStart: i + 196 + pitchIndex * 2,
            parameterNoEnd: i + 197 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Natural`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 198 + pitchIndex * 2,
            parameterNoEnd: i + 199 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Penta`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 200 + pitchIndex * 2,
            parameterNoEnd: i + 201 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Blues`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 202 + pitchIndex * 2,
            parameterNoEnd: i + 203 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Raga`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 206 + pitchIndex * 2,
            parameterNoEnd: i + 207 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Fourths`,
            descriptor: parameterDescriptors.raw
          });
          defineParameter({
            parameterNoStart: i + 208 + pitchIndex * 2,
            parameterNoEnd: i + 209 + pitchIndex * 2,
            name: `${v} Pitch ${pitchIndex + 1} Fifths`,
            descriptor: parameterDescriptors.raw
          });
        }
      };

      const defineModEffectParameter = (parameterNoStart: number) => { };

      const defineDelayEffectParameter = (parameterNoStart: number) => { };

      const defineReverbEffectParameter = (parameterNoStart: number) => { };

      defineParameter({
        parameterNoStart: 24,
        parameterNoEnd: 25,
        name: "Timbre Mode",
        descriptor: parameterDescriptors.singleDual,
      });
      defineParameter({
        parameterNoStart: 26,
        parameterNoEnd: 27,
        name: "Octave Shift",
        descriptor: parameterDescriptors.signedTwoByte,
      });
      defineParameter({
        parameterNoStart: 36,
        parameterNoEnd: 37,
        name: "Background Color",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 42,
        parameterNoEnd: 43,
        name: "AssignKnob1 Param",
        descriptor: parameterDescriptors.assignKnob
      });
      defineParameter({
        parameterNoStart: 50,
        parameterNoEnd: 51,
        name: "AssignKnob2 Param",
        descriptor: parameterDescriptors.assignKnob
      });
      defineParameter({
        parameterNoStart: 58,
        parameterNoEnd: 59,
        name: "AssignKnob3 Param",
        descriptor: parameterDescriptors.assignKnob
      });
      defineParameter({
        parameterNoStart: 66,
        parameterNoEnd: 67,
        name: "AssignKnob4 Param",
        descriptor: parameterDescriptors.assignKnob
      });
      defineParameter({
        parameterNoStart: 74,
        parameterNoEnd: 75,
        name: "AssignKnob5 Param",
        descriptor: parameterDescriptors.assignKnob
      });
      setTimbreParameterInfo(0, 104);
      setTimbreParameterInfo(1, 456);
      defineParameter({
        parameterNoStart: 808,
        parameterNoEnd: 809,
        name: "Tempo",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 810,
        parameterNoEnd: 811,
        name: "Arp Off/On",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 812,
        parameterNoEnd: 813,
        name: "Latch",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 814,
        parameterNoEnd: 815,
        name: "Target",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 816,
        parameterNoEnd: 817,
        name: "Key Sync",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 818,
        parameterNoEnd: 819,
        name: "Type",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 820,
        parameterNoEnd: 821,
        name: "Octave Range",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 822,
        parameterNoEnd: 823,
        name: "Gate Time",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 824,
        parameterNoEnd: 825,
        name: "Resolution",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 826,
        parameterNoEnd: 827,
        name: "Swing",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 828,
        parameterNoEnd: 829,
        name: "Trigger Length",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 840,
        parameterNoEnd: 841,
        name: "Trigger Step 1",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 842,
        parameterNoEnd: 843,
        name: "Trigger Step 2",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 844,
        parameterNoEnd: 845,
        name: "Trigger Step 3",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 846,
        parameterNoEnd: 847,
        name: "Trigger Step 4",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 848,
        parameterNoEnd: 849,
        name: "Trigger Step 5",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 850,
        parameterNoEnd: 851,
        name: "Trigger Step 6",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 852,
        parameterNoEnd: 853,
        name: "Trigger Step 7",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 854,
        parameterNoEnd: 855,
        name: "Trigger Step 8",
        descriptor: parameterDescriptors.raw
      });
      setVocalProcessorParameterInfo(856);
      defineModEffectParameter(1100);
      defineDelayEffectParameter(1164);
      defineReverbEffectParameter(1228);
      defineParameter({
        parameterNoStart: 1292,
        parameterNoEnd: 1293,
        name: "Mic Routing",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1294,
        parameterNoEnd: 1295,
        name: "Timbre 1 Routing",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1296,
        parameterNoEnd: 1297,
        name: "Timbre 2 Routing",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1308,
        parameterNoEnd: 1309,
        name: "EQ On/Off",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1310,
        parameterNoEnd: 1311,
        name: "Low Freq",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1312,
        parameterNoEnd: 1313,
        name: "High Freq",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1314,
        parameterNoEnd: 1315,
        name: "Low Gain",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1316,
        parameterNoEnd: 1317,
        name: "High Gain",
        descriptor: parameterDescriptors.raw
      });
      defineParameter({
        parameterNoStart: 1318,
        parameterNoEnd: 1319,
        name: "Feedback",
        descriptor: parameterDescriptors.raw
      });
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
    },

    canSendCCorNRPN(name: string): boolean {
      return this.parameters[name]?.cc !== undefined || this.parameters[name]?.nrpn !== undefined;
    },

    setValue(name: string, normalizedValue: number) {
      const timbreMatch = name.match(/^Timbre (\d+)/);
      const channel = timbreMatch ? parseInt(timbreMatch[1]) - 1 : 0;

      if (this.parameters[name]?.cc) {
        const cc = this.parameters[name]?.cc;
        const value = Math.round(normalizedValue * (cc.max - cc.min) + cc.min);
        this.midiAccessor?.sendControlChange(cc.number, value, channel);
      }

      if (this.parameters[name]?.nrpn) {
        const nrpn = this.parameters[name]?.nrpn;
        const value = Math.round(normalizedValue * (nrpn.max - nrpn.min) + nrpn.min);
        this.midiAccessor?.sendNRPN(nrpn.msb, nrpn.lsb, value, channel);
      }
    }
  },

  getters: {
    isUpdated: (state) => (name: string) => {
      return state.parameters[name]?.updated ?? false;
    },
  },
});
