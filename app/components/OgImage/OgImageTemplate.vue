<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  pageType?: "home" | "stats" | "articles" | "projects" | "about";
}>();
</script>

<template>
  <div
    class="w-full h-full flex"
    style="
      background: linear-gradient(
        135deg,
        #0a192f 0%,
        #1e1b4b 50%,
        #312e81 100%
      );
    "
  >
    <!-- Left side - Profile photo (larger for visual impact) -->
    <div class="flex items-center justify-center w-[350px] pl-12">
      <div class="relative">
        <div
          class="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 blur-xl opacity-60 animate-pulse"
          style="width: 220px; height: 220px; margin: -10px"
        />
        <img
          src="https://ofriperetz.dev/profile.png"
          alt="Ofri Peretz"
          width="200"
          height="200"
          style="
            border-radius: 50%;
            border: 4px solid rgba(139, 92, 246, 0.5);
            position: relative;
            z-index: 10;
          "
        />
      </div>
    </div>

    <!-- Right side - Text content -->
    <div class="flex-1 flex flex-col justify-center pr-16 pl-8">
      <!-- Title -->
      <h1
        class="text-white font-bold leading-tight mb-4"
        style="font-size: 52px"
      >
        {{ title || "Ofri Peretz" }}
      </h1>

      <!-- Description -->
      <p
        class="text-gray-300 leading-relaxed mb-6"
        style="font-size: 24px; max-width: 500px"
      >
        {{ description || "Engineering Leader & Open Source Creator" }}
      </p>

      <!-- Tags/badges based on page type -->
      <div class="flex gap-3">
        <template v-if="pageType === 'stats'">
          <span
            class="px-4 py-2 bg-purple-500/30 border border-purple-500/50 rounded-full text-purple-300"
            style="font-size: 18px"
            >📊 Live Stats</span
          >
          <span
            class="px-4 py-2 bg-green-500/30 border border-green-500/50 rounded-full text-green-300"
            style="font-size: 18px"
            >9K+ Downloads</span
          >
        </template>
        <template v-else-if="pageType === 'articles'">
          <span
            class="px-4 py-2 bg-green-500/30 border border-green-500/50 rounded-full text-green-300"
            style="font-size: 18px"
            >📝 Tech Articles</span
          >
          <span
            class="px-4 py-2 bg-blue-500/30 border border-blue-500/50 rounded-full text-blue-300"
            style="font-size: 18px"
            >Security & ESLint</span
          >
        </template>
        <template v-else-if="pageType === 'projects'">
          <span
            class="px-4 py-2 bg-blue-500/30 border border-blue-500/50 rounded-full text-blue-300"
            style="font-size: 18px"
            >🚀 Open Source</span
          >
          <span
            class="px-4 py-2 bg-orange-500/30 border border-orange-500/50 rounded-full text-orange-300"
            style="font-size: 18px"
            >ESLint Ecosystem</span
          >
        </template>
        <template v-else>
          <span
            class="px-4 py-2 bg-indigo-500/30 border border-indigo-500/50 rounded-full text-indigo-300"
            style="font-size: 18px"
            >🛡️ Security</span
          >
          <span
            class="px-4 py-2 bg-purple-500/30 border border-purple-500/50 rounded-full text-purple-300"
            style="font-size: 18px"
            >Open Source</span
          >
          <span
            class="px-4 py-2 bg-blue-500/30 border border-blue-500/50 rounded-full text-blue-300"
            style="font-size: 18px"
            >AI</span
          >
        </template>
      </div>
    </div>

    <!-- Bottom branding -->
    <div class="absolute bottom-6 right-8 flex items-center gap-2">
      <span class="text-gray-400" style="font-size: 18px">ofriperetz.dev</span>
    </div>
  </div>
</template>
