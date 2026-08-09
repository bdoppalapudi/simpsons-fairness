<script>
  import Act1 from './lib/acts/Act1.svelte';
  import Act2 from './lib/acts/Act2.svelte';
  import Act3 from './lib/acts/Act3.svelte';
  import Act4 from './lib/acts/Act4.svelte';
  import Act5 from './lib/acts/Act5.svelte';
  import Coda from './lib/acts/Coda.svelte';
</script>

<main>
  <header class="intro">
    <h1>When Fair Looks Unfair (and Unfair Looks Fair)</h1>
    <h2 class="subtitle">
    Simpson's Paradox in algorithmic fairness.
    </h2>
  </header>

  <p>
    Imagine an advertising platform that shows ads to different groups of people.
  At the end of the month, someone pulls up a dashboard and checks if all thr groups are being treated equally?
  The overall numbers say YES, each group is being shown ads at nearly the same rate. 
  Case closed as the system looks fair. 

  </p>

  <p>
  But what if that conclusion is wrong? Not because anyone lied about the numbers, but because the numbers themselves
  were never telling the whole story. This is the premise of the demonstration for Simpson's Paradox. 
  Simpson's Paradox is a well documented statistical phenomenon where a trend that appears in 
  aggregated data can vanish or even reverse, when the same data is sliced down to natural subgroups. The vice versa is also true, meaning
  a trend might appear in sugroups but might vanish or reverse for the aggregate data. 

  It is not a glitch and it is not manipulation. It is a mathematical reality that shows up again and again in real systems, 
  from hiring pipelines to advertising platforms to healthcare to political redistricting. 
  Our goal is to let you discover this for yourself, not by reading about it in abstract, but by watching 
  it happen, live, in front of you. 
  </p>

  <p>
  
  </p>

  <p>
  Before diving into the interactive pieces, it hels to understand the shape of the problem we are chasing. 
  Simpson's Paradox occurs when a pattern that holds true within every individual subgroup of a dataset disappears or flips entirely once the groups are combined into one aggregate category. 
  The unsettling part is that both views are mathematically correct at the same time. Nobody is lying and nothing is broken. The paradox exists because an aggregate number is really just a
   weighthed average, and how the average behaves depends heavily on how much weight each subgroup carries. Change the weigthing, and the story the average tells can change dramatically, 
   even while every underlying piece stays exactly the same. 

  </p>

  <p>
  To make this concrete rather than abstract, the explanation is build around a real, and
  relevant scenario: how ads get delivered to different groups of people, and whether that delivery can be called fair. 
  </p>

  <Act1 />
  <Act2 />
  <Act3 />
  <Act4 />
  <Act5 />
  <Coda />

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
    max-width: 750px;
    margin: 0 auto;
    padding: 0 2rem;

  }
  .intro {
    min-height: 40vh;
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
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
  footer {
    padding: 3rem 2rem;
    text-align: center;
    color: #999;
  }
</style>