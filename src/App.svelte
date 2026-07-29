<script>
  import Act1 from './lib/acts/Act1.svelte';
  import Act2 from './lib/acts/Act2.svelte';
  import Act3 from './lib/acts/Act3.svelte';
  import Act4 from './lib/acts/Act4.svelte';
  import Act5 from './lib/acts/Act5.svelte';
</script>

<main>
  <header class="intro">
    <h1>When Fair Looks Unfair (and Unfair Looks Fair)</h1>
    <p class="subtitle">
      An explorable on Simpson's Paradox in algorithmic fairness.
    </p>
  </header>

  <Act1 />
  <Act2 />
  <Act3 />
  <Act4 />
  <Act5 />

  <footer>
    <p></p>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1a1a1a;
    background: #fdfdfb;
    line-height: 1.6;
  }
  main {
    max-width: 720px;
    margin: 0 auto;
  }
  .intro {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
  }
  .intro h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #555;
  }
  footer {
    padding: 3rem 2rem;
    text-align: center;
    color: #999;
  }
</style>