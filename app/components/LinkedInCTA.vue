<script setup lang="ts">
// Smart CTA strategy:
// 1. Opens your LinkedIn PROFILE (triggers "Who viewed your profile")
// 2. Profile has your message button - they can DM from there
// 3. You get notified WHO clicked AND if they message you

const { track } = useVisitorTracking();

// Link to profile (NOT messaging) - this triggers LinkedIn's "Who viewed your profile"
const linkedinUrl = "https://www.linkedin.com/in/ofri-peretz/";

const handleClick = () => {
  track("contact_intent_click");
  // Small delay to ensure tracking fires before navigation
  setTimeout(() => {
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  }, 100);
};
</script>

<template>
  <button
    @click="handleClick"
    class="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0A66C2] to-[#0077B5] hover:from-[#004182] hover:to-[#005582] text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#0A66C2]/30"
  >
    <UIcon name="i-lucide-message-circle" class="w-5 h-5" />
    <span>Want to reach out? Let's Talk</span>
    <UIcon
      name="i-simple-icons-linkedin"
      class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
    />
  </button>
</template>
