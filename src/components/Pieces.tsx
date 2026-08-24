export const PIECE_SYMBOLS = {
  solid: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  flat: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
} as const;

export const THEME_COLORS = {
  classic: { light: '#ebecd0', dark: '#739552' },
  walnut: { light: '#c4a482', dark: '#684523' },
  midnight: { light: '#b0b6c6', dark: '#4c5564' },
  ice: { light: '#d1e6f5', dark: '#73a4c4' }
};

export const THEME_BG = {
  classic: 'bg-[#ebecd0]',
  walnut: 'bg-[#c4a482]',
  midnight: 'bg-[#b0b6c6]',
  ice: 'bg-[#d1e6f5]',
};
