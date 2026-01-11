<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-shield-check',
    title: 'Agentic Security',
    description: 'First-ever linter optimized for AI Agents (AEO) with structured metadata for reliable auto-fixing.'
  },
  {
    icon: 'i-lucide-zap',
    title: '100x Performance',
    description: 'Linear O(n) complexity architecture replacing the exponential slowdowns of legacy import plugins.'
  },
  {
    icon: 'i-lucide-layers',
    title: '299+ Rules',
    description: 'Deep specialized coverage across 11 plugins including NestJS, PostgreSQL, and secure-coding standards.'
  },
  {
    icon: 'i-lucide-check-circle-2',
    title: 'Benchmark-Verified Precision',
    description: 'Proven to have significantly fewer false positives than standard plugins, verified by our open-source benchmark suite.'
  }
]
</script>

<template>
  <div class="space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        Featured Project
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Building the security infrastructure for the AI era.
      </p>
    </div>

    <!-- Featured Card -->
    <div class="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-2xl">
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] mask-image-b" />
      <div class="absolute top-0 right-0 p-20 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div class="relative z-10 grid lg:grid-cols-2 gap-8 p-8 sm:p-12 items-center">
        <!-- Content -->
        <div class="space-y-8">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-500">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Live on v4.0.0
            </div>
            
            <h3 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Interlace <span class="text-primary-500">ESLint Ecosystem</span>
            </h3>
            
            <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              The authoritative, security-focused ESLint registry designed for the AI era. We've rebuilt static analysis from the ground up to be <strong>Agentic-First</strong>—providing structured metadata that allows LLMs to fix vulnerabilities with 90%+ success rates.
            </p>
          </div>

          <!-- Feature Grid -->
          <div class="grid sm:grid-cols-2 gap-6">
            <div 
              v-for="feature in features" 
              :key="feature.title"
              class="space-y-2"
            >
              <div class="p-2 w-fit rounded-lg bg-gray-100 dark:bg-gray-800 text-primary-500">
                <UIcon :name="feature.icon" class="w-5 h-5" />
              </div>
              <h4 class="font-bold text-gray-900 dark:text-white">
                {{ feature.title }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-4 pt-4">
            <NuxtLink
              to="https://eslint.interlace.tools"
              target="_blank"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              <UIcon name="i-lucide-zap" class="w-4 h-4" />
              Start Using Interlace
            </NuxtLink>
            
            <NuxtLink
              to="https://github.com/interlace-eslint"
              target="_blank"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <UIcon name="i-simple-icons-github" class="w-4 h-4" />
              View Source
            </NuxtLink>
          </div>
        </div>

        <!-- Visual / Stats -->
        <div class="relative">
          <!-- Reuse existing promo component for the visual interest -->
          <div class="transform hover:scale-[1.02] transition-transform duration-500">
             <LandingInterlaceEslintPromo />
          </div>
          
          <!-- Floating Badge -->
          <div class="absolute -bottom-6 -left-6 hidden lg:flex items-center gap-3 p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-xl animate-float">
            <div class="text-4xl font-black text-primary-500">299+</div>
            <div class="text-xs font-bold uppercase tracking-wider text-gray-500">
              Live<br>Rules
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask-image-b {
  mask-image: linear-gradient(to bottom, black, transparent);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
