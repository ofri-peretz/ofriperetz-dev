<script setup lang="ts">
// Smart CTA that tracks clicks and opens LinkedIn profile
// When clicked, LinkedIn will show in "Who viewed your profile"

const { trackLinkedInClick } = useVisitorTracking();
const { global } = useAppConfig();

const linkedinUrl = "https://www.linkedin.com/in/ofri-peretz/";

const handleClick = () => {
  trackLinkedInClick();
  // Small delay to ensure tracking fires before navigation
  setTimeout(() => {
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  }, 100);
};
</script>

<template>
  <button
    @click="handleClick"
    class="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0A66C2]/30"
  >
    <UIcon name="i-simple-icons-linkedin" class="w-5 h-5" />
    <span>Connect on LinkedIn</span>
    <UIcon
      name="i-lucide-external-link"
      class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"
    />
  </button>
</template>
