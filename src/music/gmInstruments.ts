// The 128 General MIDI melodic instruments, grouped into the 16 standard GM
// families in program order. Every name matches the FluidR3_GM soundfont bank
// used by the Gleitz soundfont repo, so any of them can be loaded on demand.

export interface InstrumentFamily {
  name: string;
  instruments: string[];
}

export const GM_FAMILIES: InstrumentFamily[] = [
  {
    name: 'Piano',
    instruments: [
      'acoustic_grand_piano',
      'bright_acoustic_piano',
      'electric_grand_piano',
      'honkytonk_piano',
      'electric_piano_1',
      'electric_piano_2',
      'harpsichord',
      'clavinet',
    ],
  },
  {
    name: 'Chromatic Percussion',
    instruments: [
      'celesta',
      'glockenspiel',
      'music_box',
      'vibraphone',
      'marimba',
      'xylophone',
      'tubular_bells',
      'dulcimer',
    ],
  },
  {
    name: 'Organ',
    instruments: [
      'drawbar_organ',
      'percussive_organ',
      'rock_organ',
      'church_organ',
      'reed_organ',
      'accordion',
      'harmonica',
      'tango_accordion',
    ],
  },
  {
    name: 'Guitar',
    instruments: [
      'acoustic_guitar_nylon',
      'acoustic_guitar_steel',
      'electric_guitar_jazz',
      'electric_guitar_clean',
      'electric_guitar_muted',
      'overdriven_guitar',
      'distortion_guitar',
      'guitar_harmonics',
    ],
  },
  {
    name: 'Bass',
    instruments: [
      'acoustic_bass',
      'electric_bass_finger',
      'electric_bass_pick',
      'fretless_bass',
      'slap_bass_1',
      'slap_bass_2',
      'synth_bass_1',
      'synth_bass_2',
    ],
  },
  {
    name: 'Strings',
    instruments: [
      'violin',
      'viola',
      'cello',
      'contrabass',
      'tremolo_strings',
      'pizzicato_strings',
      'orchestral_harp',
      'timpani',
    ],
  },
  {
    name: 'Ensemble',
    instruments: [
      'string_ensemble_1',
      'string_ensemble_2',
      'synth_strings_1',
      'synth_strings_2',
      'choir_aahs',
      'voice_oohs',
      'synth_choir',
      'orchestra_hit',
    ],
  },
  {
    name: 'Brass',
    instruments: [
      'trumpet',
      'trombone',
      'tuba',
      'muted_trumpet',
      'french_horn',
      'brass_section',
      'synth_brass_1',
      'synth_brass_2',
    ],
  },
  {
    name: 'Reed',
    instruments: [
      'soprano_sax',
      'alto_sax',
      'tenor_sax',
      'baritone_sax',
      'oboe',
      'english_horn',
      'bassoon',
      'clarinet',
    ],
  },
  {
    name: 'Pipe',
    instruments: [
      'piccolo',
      'flute',
      'recorder',
      'pan_flute',
      'blown_bottle',
      'shakuhachi',
      'whistle',
      'ocarina',
    ],
  },
  {
    name: 'Synth Lead',
    instruments: [
      'lead_1_square',
      'lead_2_sawtooth',
      'lead_3_calliope',
      'lead_4_chiff',
      'lead_5_charang',
      'lead_6_voice',
      'lead_7_fifths',
      'lead_8_bass__lead',
    ],
  },
  {
    name: 'Synth Pad',
    instruments: [
      'pad_1_new_age',
      'pad_2_warm',
      'pad_3_polysynth',
      'pad_4_choir',
      'pad_5_bowed',
      'pad_6_metallic',
      'pad_7_halo',
      'pad_8_sweep',
    ],
  },
  {
    name: 'Synth Effects',
    instruments: [
      'fx_1_rain',
      'fx_2_soundtrack',
      'fx_3_crystal',
      'fx_4_atmosphere',
      'fx_5_brightness',
      'fx_6_goblins',
      'fx_7_echoes',
      'fx_8_scifi',
    ],
  },
  {
    name: 'Ethnic',
    instruments: [
      'sitar',
      'banjo',
      'shamisen',
      'koto',
      'kalimba',
      'bagpipe',
      'fiddle',
      'shanai',
    ],
  },
  {
    name: 'Percussive',
    instruments: [
      'tinkle_bell',
      'agogo',
      'steel_drums',
      'woodblock',
      'taiko_drum',
      'melodic_tom',
      'synth_drum',
      'reverse_cymbal',
    ],
  },
  {
    name: 'Sound Effects',
    instruments: [
      'guitar_fret_noise',
      'breath_noise',
      'seashore',
      'bird_tweet',
      'telephone_ring',
      'helicopter',
      'applause',
      'gunshot',
    ],
  },
];

export const ALL_INSTRUMENTS: string[] = GM_FAMILIES.flatMap((f) => f.instruments);

const FAMILY_BY_INSTRUMENT: Record<string, string> = Object.fromEntries(
  GM_FAMILIES.flatMap((f) => f.instruments.map((n) => [n, f.name])),
);

/** Turn a soundfont name like `electric_guitar_clean` into `Electric Guitar Clean`. */
export function prettifyInstrument(name: string): string {
  return name
    .replace(/__/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\bfx\b/gi, 'FX')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

export function familyOf(name: string): string | undefined {
  return FAMILY_BY_INSTRUMENT[name];
}
