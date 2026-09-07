<template>
  <div class="site-shell flex min-h-screen bg-background font-sans text-foreground">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <NuxtLoadingIndicator color="#888" :height="2" />
    <Sidebar />
    <div class="flex min-w-0 flex-1 flex-col lg:ml-64">
      <MobileNav />
      <main id="main-content" tabindex="-1" class="min-w-0 w-full flex-1"><slot /></main>
    </div>
    <CommandMenu />
  </div>
</template>
