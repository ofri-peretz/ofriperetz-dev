<script setup lang="ts">
defineProps<{
  page: {
    skills?: {
      title: string
      categories: Array<{
        name: string
        items: string[]
      }>
    }
  }
}>()

// Icon mapping for skills that have brand icons
const skillIcons: Record<string, string> = {
  // Languages
  'TypeScript': 'i-simple-icons-typescript',
  'JavaScript': 'i-simple-icons-javascript',
  'Node.js': 'i-simple-icons-nodedotjs',
  'Python': 'i-simple-icons-python',
  'SQL': 'i-lucide-database',
  // Frontend
  'React': 'i-simple-icons-react',
  'Vue.js': 'i-simple-icons-vuedotjs',
  'Next.js': 'i-simple-icons-nextdotjs',
  'Nuxt': 'i-simple-icons-nuxtdotjs',
  'Vite': 'i-simple-icons-vite',
  // Backend
  'Express': 'i-simple-icons-express',
  'NestJS': 'i-simple-icons-nestjs',
  'Kafka': 'i-simple-icons-apachekafka',
  'Redis': 'i-simple-icons-redis',
  'PostgreSQL': 'i-simple-icons-postgresql',
  // Cloud & Serverless
  'AWS': 'i-simple-icons-amazonwebservices',
  'AWS Lambda': 'i-simple-icons-awslambda',
  'Vercel': 'i-simple-icons-vercel',
  'Docker': 'i-simple-icons-docker',
  'Kubernetes': 'i-simple-icons-kubernetes',
  'Serverless': 'i-lucide-cloud',
  // AI & Agentic
  'Antigravity': 'i-lucide-sparkles',
  'Cursor': 'i-lucide-terminal',
  'MCP': 'i-lucide-plug',
  'LLM APIs': 'i-lucide-brain',
  'AI Workflows': 'i-lucide-workflow',
  // DevOps & Observability
  'GitHub Actions': 'i-simple-icons-githubactions',
  'Terraform': 'i-simple-icons-terraform',
  'Jenkins': 'i-simple-icons-jenkins',
  'Packages': 'i-simple-icons-npm',
  'Grafana': 'i-simple-icons-grafana',
  'Coralogix': 'i-lucide-activity',
  'Wiz': 'i-lucide-shield-check',
  'Snyk': 'i-simple-icons-snyk',
  'Atlassian Compass': 'i-simple-icons-atlassian',
  'Nx Monorepos': 'i-simple-icons-nx',
  'Codecov': 'i-simple-icons-codecov',
  // Leadership
  'Team Building': 'i-lucide-users',
  'Technical Strategy': 'i-lucide-lightbulb',
  'Distributed Teams': 'i-lucide-globe',
  'API Architecture': 'i-lucide-network'
}

const getSkillIcon = (skill: string): string | null => {
  return skillIcons[skill] || null
}
</script>

<template>
  <UPageSection
    v-if="page.skills"
    id="skills"
    class="scroll-mt-20"
  >
    <div class="text-center mb-8">
      <a
        href="#skills"
        class="group inline-flex items-center gap-2 hover:text-primary-500 transition-colors"
      >
        <h2
          class="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors"
        >
          {{ page.skills.title }}
        </h2>
        <UIcon
          name="i-lucide-link"
          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="category in page.skills.categories"
        :key="category.name"
        class="hover:shadow-lg transition-shadow"
      >
        <div class="space-y-3">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ category.name }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="skill in category.items"
              :key="skill"
              color="primary"
              variant="subtle"
              size="sm"
              class="inline-flex items-center gap-1.5"
            >
              <UIcon
                v-if="getSkillIcon(skill)"
                :name="getSkillIcon(skill)!"
                class="w-3.5 h-3.5"
              />
              {{ skill }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </UPageSection>
</template>
