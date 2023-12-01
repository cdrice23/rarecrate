import '../styles/globals.scss';

export const decorators = [];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  toolbar: {
    'storybook-backgrounds': { hidden: true },
  },
  themes: {
    clearable: false,
    default: 'Light',
    list: [
      { name: 'Light', class: null, color: '#ffffff', default: true },
      { name: 'Dark', class: 'dark', color: '#242424' },
    ],
    target: 'html',
  },
};
