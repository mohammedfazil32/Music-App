import type { Album, Artist, Genre, LyricLine, Playlist, Track } from '../types';

/**
 * The Sonic Curator catalog — the single source of static content for the app.
 *
 * Nothing here is duplicated in components: pages compose these records through
 * the selectors in `src/lib/catalog.ts`. Tracks point at their album and artist
 * by id, so album/artist/genre/playlist pages are all views over one dataset.
 *
 * Audio: SoundHelix publishes CORS-enabled sample MP3s, used here as stand-in
 * streams. If a stream is unreachable the player falls back to the generative
 * synth voice (see `src/lib/audio/engine.ts`), so playback still works offline.
 *
 * Track durations are the real lengths of those MP3s (all 192kbps CBR), so the
 * times in lists match what the seekbar reports. Re-measure them if the audio
 * sources ever change.
 */

const audio = (n: number): string => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const CDN = 'https://lh3.googleusercontent.com/aida-public/';

/** Artwork lifted from the Stitch designs in `.stitch/designs/`. */
const ART = {
  hero: `${CDN}AB6AXuCcuMHTwL3pLOIB_rF1pFhCtz_sc24-I3p8KDIxCMYdDNiqsgo9gWq-IBcGTj5xxgIhTEt_N2j3gldsuX4eZl3FXGLtETmOJEHoUgyh6idZW1I93-6yu_3HR-NgtzCuzw8vjRy3pXZSb5-Scj3a371wKWNQsevVQS-HmWfaBhGE0_h2QOdRcb9WytbiV1hT5b28pxgPLsRyHcQYs-g6I7-oJlquVoyo9y1vthfTqlnhQie9X7eAxhH310CoK6Q9A48MUjiQhz_4jxm5`,
  electricDreams: `${CDN}AB6AXuCg4NZKiqsM6Dt_ct7eFQVPgY9uX_Ed6uZC0f4s-LEe4yJyN0nWfwMG-YyEyGVxvQyICED2WGSBgCsFcRO7-XQs7Arm_slr1P7R7yRTBch8lRTXPif1biSNE6eHHbhQfSOZdN0Er3n4HPrkCv7vYoDQhxVRjDdHVerWV8sM_-iYGxbWRsGun84kCedsCCkMFlcwoAUh3lFSsX2XTtvpB9HW7UTpyxq6UQkWUnVlxs_-WEpYybrrWMfUdQ-vxPXuB5oMIyjbEn3OZQwI`,
  signalDecay: `${CDN}AB6AXuBueq1JbK6VP-fGe-Y6RC8meK64G89yBUKwMPXhmlCqhfl6lQgv_Q-3brpwuf1x28Ue0-Zx2l-KgW1MnMAVjQIeMQ1Cm_bTezDl0dVpEJlj0bBdS53uaXCDbf_LVgGaERipFLi_81zZOGZRnnx1H_1riNZmt6kzNB1VBuLuyWLE7PrV1zgzVYAO93dvppoKfxFpB42LizIt5nWWZ44mcUMSPl6wEYj12FS1rrgw6Rm2OfQJRlxHba1L_FXzkq_6PvhJMVAoWZphnnqO`,
  moonbeam: `${CDN}AB6AXuCl3Ew-KIIb4i2fUXH20nvW3PHZ8qBot-3WOkH8kF_nOOp7IRCsA-uwrjuIqGJmyGExWsYPvYR7xJRJVuHWsYWtuBNb0sJo7MHzbReFZT64fGBbStFkEnjAnU3YDoFcsEmNac2HdJnrxWYeEd8YESE12Wg3RkXZQCHq92EdV3M-MIolZQedqqscFNRi2Nwr6Ct800HnpoLj_RqN6hxltcaZUuGtps1DBjV0NZEFwkI-wWMt10RMvGyqcgXSJRddMR6MF-gvDROiHOI3`,
  cityLights: `${CDN}AB6AXuBRLBbr38o-YSR0ZsycBLXO1AbK0KSs2nbMQj9fkIF3EQl_3H9uQ8YoQd8cQdHAouTVaDlsgekdWmDzp2luwRSlaaly3uBfnlLrnPgPacRJGWEjcrHWgdWnf8Tjokd5fwovfIP7a7UiguTslQCkFugLHQzsKAefMpm1dhPNRBSh-e1mvrTsR3o4zYo-Vv0bgPQ6CTisC0LtKqRLXr4ca4mmtI-TiKBYvy56Nn6filvjdXW0XmcGRNpQ2cYki_QGgM8nenZlURhAloBk`,
  soulArchitecture: `${CDN}AB6AXuCsM8KHN6KoHB82wUNz65Br963J4ydysnAx7jcatFHu0x6duqkDd309AhIXuYveTKpIUmuBiLagZfZ8YhNeZMdzJyZVyzgEgio54e-3InTr9M1bxYk7tbD8qW8FaJ7CyUY39qo_g3VNIqUsK7jzQ07phEwbhdYlr8gC4K-n-fBpWoF2L69GxLwdZsnciKA2rHz3dKlvs-ycQcYCnQbJguvOx9-9O64OzLUg2TwMHAZpxotIWo-9uAt8s7tse5-ZQ5G9elI_dS9H0RBx`,
  analogWhispers: `${CDN}AB6AXuA9FR1hP40LCPlKYIOQxPE-TcT0hYS8qkGILHovWEyrMtYBoXWC8K8Ht06Rh7YI7qwIAb_LmpIgeNvDxT9YudZJt0OZeG8RK6rTbH8NM8wtEfkGUBf3aVOEwMhkwhlxzwp8LaWmG3D8y-aOrONfcyWyrhDDdNy8RVWC_qlXKxdeobVNRHrU39y9EImBbLU9EZGVnSmJ5ch79dXl1XRkfgYxIR6DZaDOLIuIjbtzfK-p5V-mo2zGKelu8mgZnGgac1ZvZodF8mFrY6CG`,
  neoClassicalDrift: `${CDN}AB6AXuB2WS0347l-kABitoT05OeW-7C4tpsSmUIA4--csrUOHmH0K6jita7ZgpTfVmJjAgYvKTy_6zKkbyb_w4w0jAIUHAEK4E0MggHIwIIFPTsMnPwMU4k0Aw_9nJ_hS0ZumjXUf_RpODOvrZ7X_AXAB7gEKR6HIDMEfF7MdvQP4tP-3bGAhIGWcWHv_Su8iMm3vcRQLc3s1QW8I2FsEwLfRms7AbAkQUofm3YDYTjyqvnJ-clJagJn1OEFOJb0PnCXZF1U8OU8zJwvmpfa`,
  afterHours: `${CDN}AB6AXuCGO0J7E5lnuE4B8YRdwqxb8_YI1mi3FavthQ5F1fhOyqQIL-Mpx4akzdEd-B3WR6RbKwmlpTN5Fs2Pn1I8qtdqFNrzVJ5ROjzTSoBoSOmGnSoHbxEBxo_tfL3QhT9uFQRjZ-IkQI-cvE7m_cQ-9xI5NQyVL1RJNA_WSTm3TztrqQqWbISX7fNofOf4_wkJ7t25NCvA_Kjj2iW7-1pKWOZu461KwPK0SvTqcSC_7CV6t9hAU7RqCzOaqXwrLpXbhsm-vXodrCHqVvjU`,
  deepFocus: `${CDN}AB6AXuBnIjNriEOn6do5GXlDxsYXxcqPD5_zSIqgELuqSA61M1rDlhk4so0Gf1JUqy598giJAd_7nCbJuri-UXkg1LqQmI48rSWpd2jfeqEFlzjJGBU2VlW0ayjV5TuqGCuWJOr_iszRghvpDf0XoegVB9XBnMi6YAoiTuO-vUye62-Ff3ggmHoasslLpvT9ZBe6PwYpRnbNP9u4RVWeOIlGV51tcJqgifKQGOk8aUnPzIToV3ZZGZZJ0ScZfUb6mQ6-h4x1ri0ss5mm7LZX`,
  mixA: `${CDN}AB6AXuApXRi-pihiLGqb95OqY0GJbCaT2YT29k9FR6XeLA851qoB3VOPFozONwKywp8tYLqftd17JmYPEXAxcB87V6k-0D484szL_d9W6pj6sSclUdTpWx-f0wx5TMr0_3th0CED89jqzPgErmS05yYfyY6T7TssoV8vX9SvnXXf3vbTNz-v-T2v3cbD154slIJBDJna1VMOrjvDcYjph_rIuKxzk4CHSD_bPsBp_dL7Tnjy6NjeyjLZ5rgCNgyitD55pW-FDRk46V41x---`,
  mixB: `${CDN}AB6AXuCVqYW9-kDiN8ErzGrfP97rFeDQTtU_JAfnWyjOj31f15FUZeTNQQ1_w5_ABbFcSbVXshKVYLzRrFGFowX_z_vrYgN2geLBZGVBlb42rEwkt_xkUBr1BIVWsqP-zxx4aCrCu-8KeybxMkeJ51BCTqHDaOyzAVn4IzFmyZxzWCUBbwFyy_I0jAYn_ZMHYdPRuzhXcI6KuC9PVUUiVEmWfMzOgOFpaDQvfYznQE9-upOgsGG2GwX5YDJbGjmhZCluTnRdWKrVJ2Bnwlsx`,
  avatar: `${CDN}AB6AXuAOUiMFd0TqH8bTTF35FeFUNkuoK2aljfyf61IaF5CfqFJI-2qIrCBEHfCCX2b0VEOE7ul1v4u-rieLeySXst2E3QCqZox7nSqWTV3T5YCs28r8gTQBMCAoyWx2S8lRld0FcPkaOBUy_EIzjxBlqjsq9Uj6CjSFyTLutecnjnqdmaVJQJf2AG8iwIzzzIKYXmsnFH5vMddzH_OowiYc4sn5ndJ-ykDGwd-ZLfiHajdfU0nogCz8rMo-oCxiJ1GCDt09KWL-0cY6y15P`,
  genreWorkout: `${CDN}AB6AXuAADRJOT9gkgoGRdn6zLmKrtf0JfqE82PkHJmtcNiTiPC3EzZn174ibIxzPAdMXtccf7jmD7Dg4-3NT_BaPaMWlfD_Tf6kBZP8iT6eC5GdKnlpVJ_UjmbGe_GE5yCfzi8mtT1U7DUg8ZYqde54v5ql8aWlhG4Mp4chVdTmUoCsag42Yc0Wc0noyP-k-7nHwz_8XRW_kexmBK9UCl9nsWnjHL0xBbo2SwEQBhRmN56-44CHMQlelLNvRqn05KyIf5EVP5unKliHne2ce`,
  genrePop: `${CDN}AB6AXuDyyPRmBz14vQT7jp-lmnsuAWMGLL4OPR24rmUhxABw9bZkrR_IIGWxL-QC1ZXV9jiCJsMSpz9n7sxYKDrds3_6rJ3lQLr5LNWmLvvqLmOX2K9A2hOruuyDAH7x8r0dIOrRu3ocU-mZ-eMAmcccaS55Dwv7CNGh5kMCoJ-ikdnL8LZXvAWZ3-LmvmuGATVDAq5NfuqCqdNihxIgeFtMNXKKz0iQG-pAICVfW1i8xPD1ORtvGmOu5MMVHn3f_3EhgTq3pKxlc9FeVyad`,
  genreElectronic: `${CDN}AB6AXuAu06xulc3Rby6nz2h1YnZOQYNUMl6lEmtghFtS7HbprtIlHvf_AmiI098FBWdQPhzBGqPLXZnjF_8Z92rz2GJIdfgR8ZcTohr4SCESUPzQfIjArbQQHp0ZjzspCg4O9V1wUUNld7o-XOV4rrfuQmYqWmWwcLVoFY-TaebUz-3x9VsyvGpH9jFtCmPoZEjI2GfSpym3vJX7s_P61MqFk_LwxGH7qrmlfNx2zahg_Feoke9RHVbTmJE_RiOnKnvyGDe_2wBqQXwiBnmn`,
  genreJazz: `${CDN}AB6AXuBgyV2dAxaN3laOU830isT4dC-H2CqfqXqg27UY7XmC3zlo5tzR5GrDvjzxNQ1IhL8FLo1ClAyN0Uj-6LUkKkxsFdZDhhWs8CbTWCOeKOf1e2G1ImG-oEHdEXs9ABkOOigCqQAxySvcgu4vebFr8yD52zTFZdgfA7qJU9JtkyO85vRS5yfpJ3dcQuZ1hy7o7n67V7Fcy6mwI8gRSlfXEeLZ6IhGjdlnOxMGVzbm_TqdKBAf6F9QpgSBYqYnTnUDoioQIK61Uqliii3P`,
  genreRock: `${CDN}AB6AXuD4NMy2zS3ZTBHtFKjim9J6coCYlEx-MkNYhPxYnmMZKhpfhm8I7H7QJSMoo7WVjilkNe4qi8m0_H6HVcPPfmU-LMfVDJ84TOvVgVpRrIjObne_ko_zDFJvJfyPb-ka1BIWGcWR0ryEFUQUX0QPiyKnCo-69oWB1aB3cDQMMvG5Q7KUVR3W64ZqvU3Ni0PwehzlwsB1f8ICAAEkhlR57Rzgsts29BGI0bFfOrBjXTbG0PO32f4gKtzYa54CVqFsETNtNEo7lut9AYzk`,
  genreIndie: `${CDN}AB6AXuBwE5ucxp0IIdx5qxGvct7gZdf4-97lh1Z9vRKynmfSWI1EGItbie9xDURZfz7JKWxpuzPpFJSOfPSP7_l0ZGPLuaPFlly2rnVA7Q3IGhhWQtLfSZtUYPHOGX7I9B8tLTgvoJk39hjmF6NLt-7ZGeZmnxvwFklpqiN41UOcySSWDCh7zlatz98vIqUkFnkkRd2kWPCt1T1eZdCBtmCvZ4nBcuwFiBhtEfzo1KO0zDlzNP1OEgF9aXCJpxcrgBuHlZSIcSxk-_vkj_R_`,
  genreClassical: `${CDN}AB6AXuCcaLB6rHwPmuTy_FJWGX7RRXlyMPtuEw-3ffqQw8BILgWMy0O_yLeOS_3r5hZTiHIBbExZnAVYLEwAO3Xl8ANWvZgkcJuRptiTnB9FTdVOMbFzb5yqT-oRTBRpP197ZcHOBfwQKk8X9zoijaQNYdFavwQRotE6zClKvjZ_C25xrxlveDRP3tJYRwyu2I8drXgEb0V2D67OOjIBxNBPA9tLzre4LYyzStm--9w0B1W1J71DhRn1_-TfhES8mWQwnNtb9KnOEwkpE49i`,
} as const;

/** The signed-in listener, used by the header and playlist ownership. */
export const currentUser = {
  name: 'Mohammed',
  handle: 'sonic.curator',
  tier: 'Premium',
  avatar: ART.avatar,
} as const;

export const artists: Artist[] = [
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    bio: 'Electronic producer pushing the boundaries of synthwave, building cathedral-sized arpeggios out of vintage analogue gear.',
    genres: ['Synthwave', 'Electronic', 'Ambient'],
    monthlyListeners: 2_480_000,
  },
  {
    id: 'luna-echo',
    name: 'Luna Echo',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    bio: 'Dreamy indie pop with ethereal vocals, recorded almost entirely between midnight and sunrise.',
    genres: ['Dream Pop', 'Indie Pop', 'Alternative'],
    monthlyListeners: 1_640_000,
  },
  {
    id: 'midnight-drive',
    name: 'Midnight Drive',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600',
    bio: 'Retro-futuristic beats for late night journeys. One long highway, rendered in magenta.',
    genres: ['Retrowave', 'Electronic', 'Ambient'],
    monthlyListeners: 934_000,
  },
  {
    id: 'amara-k',
    name: 'Amara K.',
    image: ART.soulArchitecture,
    bio: 'Neo-soul songwriter whose arrangements sit somewhere between a string quartet and a late-night radio session.',
    genres: ['Neo-Soul', 'Jazz'],
    monthlyListeners: 1_210_000,
  },
  {
    id: 'the-alchemist',
    name: 'The Alchemist',
    image: `${CDN}AB6AXuBHyXBXKA1xtZaPjJ0MYX-tJJHKbUSlBY9x23JjZpjAzPxC5QNWP1fhul4YgqPG_BfEMHdNDHo8j9uPGRnJLDNfRY7kUlATAUEKh7xcfbSDDyw55HOY3Prg9yWwtBTgJwn_Ww2nT97-ywR51KvEHETPJ_jEoAZApKg8ZGNY4z24EmhfPOgOw3fg1RsDy_43HQuhCKTEVWH1EwalgsIq_TpcwYbYynT2mEH7sfi_ilUXwY7nurCqwIDmS9H1zTI_YJZ_rfBEP68lmXKy`,
    bio: 'Tape-saturated lo-fi built from field recordings, forgotten cassettes and a great deal of patience.',
    genres: ['Lo-fi', 'Ambient'],
    monthlyListeners: 3_120_000,
  },
  {
    id: 'julian-rossi',
    name: 'Julian Rossi',
    image: `${CDN}AB6AXuC8B1hGBzTKZ2OipX8bPiU5K7eZUKJ3_kiq1BXNLVBgWD98J5n0JBEx6hwCGalFFam7eWoz0urEn7pBtPz3k6-hHmMy99z4ky8Di2OTQP1bd4qYrvlM1i6Ww2Y3cmEdjivBsIf5bWveBg9dIG9xHNM_bl4dT8maR7d1Q00gCMZ2ixQvTtL63T1CSNusPgAxjFKRScHYyjvznKpmc1aJ8sbBXAPTsHbVqwh77VfhiLghO30HfNqphAPyHg6ogU0kDmm9FlVh71ZRT-1G`,
    bio: 'Neo-classical pianist working in long, patient forms. Every recording keeps the room in the mix.',
    genres: ['Neo-Classical', 'Ambient'],
    monthlyListeners: 712_000,
  },
];

export const albums: Album[] = [
  {
    id: 'electric-dreams',
    title: 'Electric Dreams',
    artist: 'Neon Pulse',
    artistId: 'neon-pulse',
    artwork: ART.electricDreams,
    year: 2024,
    genre: 'Synthwave',
    description: 'Four movements of neon-lit arpeggios, mastered for the drive home.',
  },
  {
    id: 'signal-decay',
    title: 'Signal Decay',
    artist: 'Neon Pulse',
    artistId: 'neon-pulse',
    artwork: ART.signalDecay,
    year: 2022,
    genre: 'Electronic',
    description: 'The record that turned static into melody.',
  },
  {
    id: 'moonbeam',
    title: 'Moonbeam',
    artist: 'Luna Echo',
    artistId: 'luna-echo',
    artwork: ART.moonbeam,
    year: 2024,
    genre: 'Dream Pop',
    description: 'Reverb-drenched pop written entirely after midnight.',
  },
  {
    id: 'city-lights',
    title: 'City Lights',
    artist: 'Midnight Drive',
    artistId: 'midnight-drive',
    artwork: ART.cityLights,
    year: 2023,
    genre: 'Retrowave',
    description: 'A concept record about one very long drive.',
  },
  {
    id: 'soul-architecture',
    title: 'Soul Architecture',
    artist: 'Amara K.',
    artistId: 'amara-k',
    artwork: ART.soulArchitecture,
    year: 2024,
    genre: 'Neo-Soul',
    description: 'Strings, Rhodes and a voice recorded three inches from the mic.',
  },
  {
    id: 'analog-whispers',
    title: 'Analog Whispers',
    artist: 'The Alchemist',
    artistId: 'the-alchemist',
    artwork: ART.analogWhispers,
    year: 2023,
    genre: 'Lo-fi',
    description: 'Dust, tape hiss and room tone, arranged deliberately.',
  },
  {
    id: 'neo-classical-drift',
    title: 'Neo-Classical Drift',
    artist: 'Julian Rossi',
    artistId: 'julian-rossi',
    artwork: ART.neoClassicalDrift,
    year: 2024,
    genre: 'Neo-Classical',
    description: 'Piano, felt dampers, and the sound of a very quiet hall.',
  },
  {
    id: 'after-hours-tapes',
    title: 'After Hours Tapes',
    artist: 'Midnight Drive',
    artistId: 'midnight-drive',
    artwork: ART.afterHours,
    year: 2021,
    genre: 'Ambient',
    description: 'Long-form ambient sketches from the archive.',
  },
];

export const tracks: Track[] = [
  // --- Electric Dreams / Neon Pulse
  { id: 't-neon-nights', title: 'Neon Nights', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Electric Dreams', albumId: 'electric-dreams', duration: 373, artwork: ART.electricDreams, genre: 'Synthwave', year: 2024, src: audio(1), plays: 4_820_331 },
  { id: 't-digital-rain', title: 'Digital Rain', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Electric Dreams', albumId: 'electric-dreams', duration: 426, artwork: ART.electricDreams, genre: 'Synthwave', year: 2024, src: audio(2), plays: 3_115_902 },
  { id: 't-chrome-horizon', title: 'Chrome Horizon', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Electric Dreams', albumId: 'electric-dreams', duration: 344, artwork: ART.electricDreams, genre: 'Synthwave', year: 2024, src: audio(3), plays: 1_988_450 },
  { id: 't-afterglow-protocol', title: 'Afterglow Protocol', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Electric Dreams', albumId: 'electric-dreams', duration: 303, artwork: ART.electricDreams, genre: 'Synthwave', year: 2024, src: audio(4), plays: 1_204_776 },

  // --- Signal Decay / Neon Pulse
  { id: 't-signal-decay', title: 'Signal Decay', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Signal Decay', albumId: 'signal-decay', duration: 354, artwork: ART.signalDecay, genre: 'Electronic', year: 2022, src: audio(5), plays: 2_450_118 },
  { id: 't-ether-drift', title: 'Ether Drift', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Signal Decay', albumId: 'signal-decay', duration: 280, artwork: ART.signalDecay, genre: 'Electronic', year: 2022, src: audio(6), plays: 5_902_664 },
  { id: 't-static-bloom', title: 'Static Bloom', artist: 'Neon Pulse', artistId: 'neon-pulse', album: 'Signal Decay', albumId: 'signal-decay', duration: 421, artwork: ART.signalDecay, genre: 'Electronic', year: 2022, src: audio(7), plays: 883_201 },

  // --- Moonbeam / Luna Echo
  { id: 't-starlight-serenade', title: 'Starlight Serenade', artist: 'Luna Echo', artistId: 'luna-echo', album: 'Moonbeam', albumId: 'moonbeam', duration: 325, artwork: ART.moonbeam, genre: 'Dream Pop', year: 2024, src: audio(8), plays: 6_331_004 },
  { id: 't-ocean-waves', title: 'Ocean Waves', artist: 'Luna Echo', artistId: 'luna-echo', album: 'Moonbeam', albumId: 'moonbeam', duration: 389, artwork: ART.moonbeam, genre: 'Dream Pop', year: 2024, src: audio(9), plays: 2_774_889 },
  { id: 't-paper-moon', title: 'Paper Moon', artist: 'Luna Echo', artistId: 'luna-echo', album: 'Moonbeam', albumId: 'moonbeam', duration: 527, artwork: ART.moonbeam, genre: 'Dream Pop', year: 2024, src: audio(10), plays: 1_450_223 },
  { id: 't-velvet-static', title: 'Velvet Static', artist: 'Luna Echo', artistId: 'luna-echo', album: 'Moonbeam', albumId: 'moonbeam', duration: 551, artwork: ART.moonbeam, genre: 'Dream Pop', year: 2024, src: audio(11), plays: 990_512 },

  // --- City Lights / Midnight Drive
  { id: 't-downtown-cruise', title: 'Downtown Cruise', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'City Lights', albumId: 'city-lights', duration: 514, artwork: ART.cityLights, genre: 'Retrowave', year: 2023, src: audio(12), plays: 3_802_117 },
  { id: 't-neon-horizon', title: 'Neon Horizon', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'City Lights', albumId: 'city-lights', duration: 470, artwork: ART.cityLights, genre: 'Retrowave', year: 2023, src: audio(13), plays: 7_118_940 },
  { id: 't-midnight-highs', title: 'Midnight Highs', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'City Lights', albumId: 'city-lights', duration: 516, artwork: ART.cityLights, genre: 'Retrowave', year: 2023, src: audio(14), plays: 2_004_663 },
  { id: 't-tail-lights', title: 'Tail Lights', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'City Lights', albumId: 'city-lights', duration: 438, artwork: ART.cityLights, genre: 'Retrowave', year: 2023, src: audio(15), plays: 1_338_775 },

  // --- Soul Architecture / Amara K.
  { id: 't-velvet-signal', title: 'Velvet Signal', artist: 'Amara K.', artistId: 'amara-k', album: 'Soul Architecture', albumId: 'soul-architecture', duration: 483, artwork: ART.soulArchitecture, genre: 'Neo-Soul', year: 2024, src: audio(16), plays: 4_210_558 },
  { id: 't-golden-hour', title: 'Golden Hour', artist: 'Amara K.', artistId: 'amara-k', album: 'Soul Architecture', albumId: 'soul-architecture', duration: 373, artwork: ART.soulArchitecture, genre: 'Neo-Soul', year: 2024, src: audio(1), plays: 1_902_441 },
  { id: 't-slow-gravity', title: 'Slow Gravity', artist: 'Amara K.', artistId: 'amara-k', album: 'Soul Architecture', albumId: 'soul-architecture', duration: 426, artwork: ART.soulArchitecture, genre: 'Neo-Soul', year: 2024, src: audio(2), plays: 1_115_320 },

  // --- Analog Whispers / The Alchemist
  { id: 't-phantom-frequency', title: 'Phantom Frequency', artist: 'The Alchemist', artistId: 'the-alchemist', album: 'Analog Whispers', albumId: 'analog-whispers', duration: 344, artwork: ART.analogWhispers, genre: 'Lo-fi', year: 2023, src: audio(3), plays: 8_440_912 },
  { id: 't-dust-and-tape', title: 'Dust & Tape', artist: 'The Alchemist', artistId: 'the-alchemist', album: 'Analog Whispers', albumId: 'analog-whispers', duration: 303, artwork: ART.analogWhispers, genre: 'Lo-fi', year: 2023, src: audio(4), plays: 5_128_004 },
  { id: 't-room-tone', title: 'Room Tone', artist: 'The Alchemist', artistId: 'the-alchemist', album: 'Analog Whispers', albumId: 'analog-whispers', duration: 354, artwork: ART.analogWhispers, genre: 'Lo-fi', year: 2023, src: audio(5), plays: 3_009_887 },

  // --- Neo-Classical Drift / Julian Rossi
  { id: 't-glass-meridian', title: 'Glass Meridian', artist: 'Julian Rossi', artistId: 'julian-rossi', album: 'Neo-Classical Drift', albumId: 'neo-classical-drift', duration: 280, artwork: ART.neoClassicalDrift, genre: 'Neo-Classical', year: 2024, src: audio(6), plays: 1_772_310 },
  { id: 't-winter-etude', title: 'Winter Étude', artist: 'Julian Rossi', artistId: 'julian-rossi', album: 'Neo-Classical Drift', albumId: 'neo-classical-drift', duration: 421, artwork: ART.neoClassicalDrift, genre: 'Neo-Classical', year: 2024, src: audio(7), plays: 908_664 },
  { id: 't-suspended-light', title: 'Suspended Light', artist: 'Julian Rossi', artistId: 'julian-rossi', album: 'Neo-Classical Drift', albumId: 'neo-classical-drift', duration: 325, artwork: ART.neoClassicalDrift, genre: 'Neo-Classical', year: 2024, src: audio(8), plays: 611_209 },

  // --- After Hours Tapes / Midnight Drive
  { id: 't-after-hours', title: 'After Hours', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'After Hours Tapes', albumId: 'after-hours-tapes', duration: 389, artwork: ART.afterHours, genre: 'Ambient', year: 2021, src: audio(9), plays: 2_211_003 },
  { id: 't-echo-chamber', title: 'Echo Chamber', artist: 'Midnight Drive', artistId: 'midnight-drive', album: 'After Hours Tapes', albumId: 'after-hours-tapes', duration: 527, artwork: ART.afterHours, genre: 'Ambient', year: 2021, src: audio(10), plays: 1_664_228 },
];

/** Curated (non-editable) playlists shown on Home and Search. */
export const curatedPlaylists: Playlist[] = [
  {
    id: 'pl-vaporwave-retrospective',
    title: 'Vaporwave Reflections',
    description: 'A hand-picked journey through the most influential ambient and electronic textures of the year.',
    artwork: ART.hero,
    trackIds: ['t-ether-drift', 't-after-hours', 't-echo-chamber', 't-static-bloom', 't-room-tone', 't-suspended-light', 't-chrome-horizon'],
    createdAt: '2026-01-12',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-midnight-vibes',
    title: 'Midnight Vibes',
    description: 'Perfect soundtrack for late night coding sessions.',
    artwork: ART.cityLights,
    trackIds: ['t-midnight-highs', 't-neon-horizon', 't-tail-lights', 't-after-hours', 't-ether-drift'],
    createdAt: '2026-02-01',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-chill-discoveries',
    title: 'Chill Discoveries',
    description: 'Discover your next favourite indie track.',
    artwork: ART.moonbeam,
    trackIds: ['t-paper-moon', 't-velvet-static', 't-ocean-waves', 't-slow-gravity', 't-room-tone'],
    createdAt: '2026-02-05',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-retro-future',
    title: 'Retro Future',
    description: 'Synthwave and retrowave essentials.',
    artwork: ART.electricDreams,
    trackIds: ['t-neon-nights', 't-downtown-cruise', 't-digital-rain', 't-chrome-horizon', 't-afterglow-protocol'],
    createdAt: '2026-02-10',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-electronic-focus',
    title: 'Electronic Focus',
    description: 'Long-form electronic textures for deep work.',
    artwork: ART.mixA,
    trackIds: ['t-signal-decay', 't-static-bloom', 't-glass-meridian', 't-suspended-light', 't-after-hours'],
    createdAt: '2026-03-02',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-daily-lift',
    title: 'Daily Lift',
    description: 'Uplifting tracks to start your day.',
    artwork: ART.mixB,
    trackIds: ['t-golden-hour', 't-starlight-serenade', 't-velvet-signal', 't-neon-nights', 't-dust-and-tape'],
    createdAt: '2026-03-14',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
  {
    id: 'pl-deep-focus',
    title: 'Deep Focus',
    description: 'Minimise distractions with curated ambient textures.',
    artwork: ART.deepFocus,
    trackIds: ['t-room-tone', 't-after-hours', 't-winter-etude', 't-suspended-light', 't-echo-chamber', 't-glass-meridian'],
    createdAt: '2026-03-20',
    isPublic: true,
    owner: 'The Sonic Curator',
    editable: false,
  },
];

/**
 * Seed content for a first-time visitor's library. After the first render the
 * library lives in localStorage and these values are no longer consulted.
 */
export const seedUserPlaylists: Playlist[] = [
  {
    id: 'pl-user-midnight-sessions',
    title: 'Midnight Sessions',
    description: 'Everything that works after 1am.',
    artwork: ART.electricDreams,
    trackIds: ['t-ether-drift', 't-neon-horizon', 't-after-hours', 't-phantom-frequency', 't-midnight-highs'],
    createdAt: '2026-05-18',
    isPublic: false,
    owner: currentUser.name,
    editable: true,
  },
  {
    id: 'pl-user-focus-flow',
    title: 'Focus Flow',
    description: 'No vocals, no surprises.',
    artwork: ART.deepFocus,
    trackIds: ['t-glass-meridian', 't-winter-etude', 't-room-tone', 't-suspended-light'],
    createdAt: '2026-06-02',
    isPublic: false,
    owner: currentUser.name,
    editable: true,
  },
];

export const seedLikedTrackIds: string[] = [
  't-neon-horizon',
  't-velvet-signal',
  't-glass-meridian',
  't-echo-chamber',
  't-phantom-frequency',
];

export const seedFollowedArtistIds: string[] = ['neon-pulse', 'the-alchemist'];

export const seedLikedAlbumIds: string[] = ['electric-dreams', 'moonbeam'];

/** Browse categories. Each `name` matches a real `Track.genre` so filters resolve. */
export const genres: Genre[] = [
  { id: 'synthwave', name: 'Synthwave', image: ART.genreElectronic, gradient: 'from-blue-900/60' },
  { id: 'dream-pop', name: 'Dream Pop', image: ART.genrePop, gradient: 'from-pink-900/60' },
  { id: 'retrowave', name: 'Retrowave', image: ART.genreRock, gradient: 'from-red-900/60' },
  { id: 'neo-soul', name: 'Neo-Soul', image: ART.genreJazz, gradient: 'from-amber-900/60' },
  { id: 'lo-fi', name: 'Lo-fi', image: ART.genreWorkout, gradient: 'from-emerald-900/60' },
  { id: 'neo-classical', name: 'Neo-Classical', image: ART.genreClassical, gradient: 'from-stone-800/60' },
  { id: 'ambient', name: 'Ambient', image: ART.genreIndie, gradient: 'from-purple-900/60' },
  { id: 'electronic', name: 'Electronic', image: ART.deepFocus, gradient: 'from-cyan-900/60' },
];

/** Time-coded lyrics, keyed by track id. Tracks without an entry show an empty state. */
export const lyricsByTrackId: Record<string, LyricLine[]> = {
  't-neon-horizon': [
    { time: 0, text: '[Instrumental intro]' },
    { time: 18, text: 'Fading lights in the mirror' },
    { time: 26, text: 'Chasing ghosts in the rain' },
    { time: 34, text: 'The neon pulse is getting clearer' },
    { time: 42, text: 'Driving through the digital pain' },
    { time: 54, text: 'Synthetic dreams are all we share' },
    { time: 62, text: 'Weighted down by the midnight air' },
    { time: 74, text: 'Electric soul, electric heart' },
    { time: 82, text: 'Watching worlds fall apart' },
    { time: 98, text: 'And the horizon keeps on burning' },
    { time: 110, text: 'Every exit sign a warning' },
    { time: 126, text: 'We were never coming back' },
    { time: 142, text: '[Bridge]' },
    { time: 168, text: 'Hold the line, hold the frequency' },
    { time: 182, text: 'Nothing here was meant to be free' },
    { time: 200, text: 'Neon horizon, take me home' },
    { time: 218, text: '[Outro]' },
  ],
  't-neon-nights': [
    { time: 0, text: '[Arpeggio]' },
    { time: 22, text: 'City hums in minor key' },
    { time: 32, text: 'Chrome reflections chasing me' },
    { time: 44, text: 'Every streetlight keeps the beat' },
    { time: 56, text: 'Every shadow knows my name' },
    { time: 72, text: 'Neon nights, we never sleep' },
    { time: 84, text: 'Neon nights, the rush runs deep' },
    { time: 104, text: 'Turn the dial until it breaks' },
    { time: 120, text: 'This is all the sound it takes' },
    { time: 150, text: '[Instrumental]' },
    { time: 196, text: 'Neon nights, we never sleep' },
    { time: 232, text: '[Fade]' },
  ],
  't-starlight-serenade': [
    { time: 0, text: '[Soft intro]' },
    { time: 14, text: 'Draw the curtain on the day' },
    { time: 24, text: 'Let the quiet have its say' },
    { time: 36, text: 'Starlight falling through the frame' },
    { time: 48, text: 'Nothing here I have to name' },
    { time: 64, text: 'Sing me something slow and true' },
    { time: 76, text: 'Half a chord and half of you' },
    { time: 96, text: 'The night is longer than it seems' },
    { time: 112, text: 'And kinder than it lets you dream' },
    { time: 140, text: '[Instrumental]' },
    { time: 180, text: 'Starlight, serenade me home' },
    { time: 205, text: '[Outro]' },
  ],
  't-velvet-signal': [
    { time: 0, text: '[Rhodes]' },
    { time: 16, text: 'You come in like a velvet signal' },
    { time: 28, text: 'Low and warm across the wire' },
    { time: 42, text: 'Everything I meant to say' },
    { time: 54, text: 'Turns to static in the choir' },
    { time: 72, text: 'So tune me in, tune me slow' },
    { time: 86, text: 'There is nowhere left to go' },
    { time: 106, text: 'Only this, only now' },
    { time: 124, text: 'Only how you say my name' },
    { time: 152, text: '[Strings]' },
    { time: 196, text: 'Velvet signal, hold the line' },
    { time: 236, text: '[Outro]' },
  ],
  't-downtown-cruise': [
    { time: 0, text: '[Engine, then drums]' },
    { time: 20, text: 'Six lanes wide and nowhere fast' },
    { time: 32, text: 'Radio playing something past' },
    { time: 46, text: 'Downtown glows a borrowed gold' },
    { time: 58, text: 'Every window rolled and cold' },
    { time: 78, text: 'Drive until the morning shows' },
    { time: 92, text: 'Drive until nobody knows' },
    { time: 118, text: 'The map is just a suggestion' },
    { time: 136, text: 'And the night has no direction' },
    { time: 170, text: '[Instrumental]' },
    { time: 240, text: 'Downtown, cruise it one more time' },
    { time: 290, text: '[Fade]' },
  ],
  't-ether-drift': [
    { time: 0, text: '[Pad swell]' },
    { time: 30, text: 'Weightless in the ether drift' },
    { time: 46, text: 'Somewhere past the signal shift' },
    { time: 64, text: 'Nothing holds and nothing breaks' },
    { time: 82, text: 'Only long, unhurried wakes' },
    { time: 108, text: '[Instrumental]' },
    { time: 168, text: 'Let it drift, let it drift' },
    { time: 210, text: '[Outro]' },
  ],
};

/** Primary sidebar navigation. */
export const navigationItems = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'search', label: 'Search', icon: 'search', path: '/search' },
  { id: 'library', label: 'Your Library', icon: 'library_music', path: '/library' },
  { id: 'liked', label: 'Liked Songs', icon: 'favorite', path: '/liked' },
  { id: 'player', label: 'Now Playing', icon: 'music_note', path: '/player' },
] as const;

export const searchSuggestions = [
  'Synthwave',
  'Neon Pulse',
  'Dream Pop',
  'Midnight Drive',
  'Ambient',
  'Lo-fi',
  'Neo-Classical',
  'Amara K.',
];

/** Editorial spotlight on the Home page. */
export const heroFeature = {
  playlistId: 'pl-vaporwave-retrospective',
  eyebrow: "Editor's Selection",
  title: 'Vaporwave Reflections: The 2026 Retrospective',
  blurb: 'A hand-picked journey through the most influential ambient and electronic textures of the year.',
  image: ART.hero,
} as const;

export const weeklyMixArtwork = [ART.mixA, ART.mixB] as const;
