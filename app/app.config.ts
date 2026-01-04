export default defineAppConfig({
  global: {
    picture: {
      dark: 'https://avatars.githubusercontent.com/u/ofri-peretz',
      light: 'https://avatars.githubusercontent.com/u/ofri-peretz',
      alt: 'Ofri Peretz'
    },
    meetingLink: 'https://cal.com/',
    email: 'contact@ofriperetz.dev',
    available: true
  },
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'slate'
    },
    pageHero: {
      slots: {
        container: 'py-18 sm:py-24 lg:py-32',
        title: 'mx-auto max-w-xl text-pretty text-3xl sm:text-4xl lg:text-5xl',
        description: 'mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted'
      }
    }
  },
  footer: {
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()} Ofri Peretz`,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/ofri-peretz',
      'target': '_blank',
      'aria-label': 'Ofri on GitHub'
    }, {
      'icon': 'i-simple-icons-x',
      'to': 'https://x.com/ofriperetzdev',
      'target': '_blank',
      'aria-label': 'Ofri on X'
    }, {
      'icon': 'i-simple-icons-linkedin',
      'to': 'https://www.linkedin.com/in/ofri-peretz/',
      'target': '_blank',
      'aria-label': 'Ofri on LinkedIn'
    }, {
      'icon': 'i-simple-icons-devdotto',
      'to': 'https://dev.to/ofri-peretz',
      'target': '_blank',
      'aria-label': 'Ofri on Dev.to'
    }, {
      'icon': 'i-simple-icons-npm',
      'to': 'https://www.npmjs.com/~ofriperetz',
      'target': '_blank',
      'aria-label': 'Ofri on NPM'
    }]
  }
})
