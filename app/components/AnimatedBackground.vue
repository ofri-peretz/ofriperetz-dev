<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <!-- Animated gradient mesh background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10"
    />

    <!-- Grid pattern -->
    <div
      class="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"
    />

    <!-- Animated gradient orbs -->
    <div
      class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-3xl animate-blob"
    />
    <div
      class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-purple-600/15 rounded-full blur-3xl animate-blob animation-delay-2000"
    />
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"
    />
  </div>
</template>

<style>
/* Grid pattern */
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, currentColor 1px, transparent 1px),
    linear-gradient(to bottom, currentColor 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Blob animation */
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 20s ease-in-out infinite;
  will-change: transform;
  transform: translateZ(0);
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-blob {
    animation: none;
  }
}
</style>
