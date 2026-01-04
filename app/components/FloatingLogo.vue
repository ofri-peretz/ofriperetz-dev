<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <!-- Floating logo elements -->
    <img
      src="/logo.png"
      alt=""
      class="absolute w-24 h-24 opacity-[0.03] dark:opacity-[0.05] animate-float-slow"
      style="top: 10%; left: 5%"
    />
    <img
      src="/logo.png"
      alt=""
      class="absolute w-32 h-32 opacity-[0.02] dark:opacity-[0.04] animate-float-medium"
      style="top: 40%; right: 8%"
    />
    <img
      src="/logo.png"
      alt=""
      class="absolute w-20 h-20 opacity-[0.025] dark:opacity-[0.045] animate-float-fast"
      style="bottom: 15%; left: 15%"
    />
    <img
      src="/logo.png"
      alt=""
      class="absolute w-28 h-28 opacity-[0.02] dark:opacity-[0.035] animate-float-slow"
      style="bottom: 30%; right: 20%"
    />
  </div>
</template>

<style>
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(-3deg);
  }
}

@keyframes float-fast {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 6s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 4s ease-in-out infinite;
}
</style>
