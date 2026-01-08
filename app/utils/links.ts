import type { NavigationMenuItem } from '@nuxt/ui'

export const navLinks: NavigationMenuItem[] = [{
  label: 'Projects',
  icon: 'i-lucide-folder',
  to: '/projects'
}, {
  label: 'Articles',
  icon: 'i-simple-icons-devdotto',
  to: '/articles'
}, {
  label: 'Stats',
  icon: 'i-lucide-bar-chart-2',
  to: '/stats'
}, {
  label: 'About',
  icon: 'i-lucide-user',
  to: '/'
}]
