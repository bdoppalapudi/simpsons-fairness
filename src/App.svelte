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
  Imagine an advertising platform that shows ads to different groups
of people job listings, housing offers, everyday retail promotions,
all mixed together. At the end of the month, someone checks the
numbers: are both groups being treated equally? For most of these ads,
that question is a matter of curiosity. But for ads tied to employment
and housing specifically, it's a live legal and ethical concern,
protected under laws like Title VII and the Fair Housing Act and real
audits of major ad platforms have found measurable delivery skew by
gender and race, even when advertisers set completely neutral
targeting. So when the dashboard says the numbers look balanced and everything feels fair, is
that actually the end of the story?

  </p>

  <p>
  But what if that conclusion is wrong? Not because anyone lied about the numbers, but because the numbers themselves
  were never telling the whole story. This is the premise of the demonstration for Simpson's Paradox. 
  Simpson's Paradox is a well documented statistical phenomenon where a trend that appears in 
  aggregated data can vanish or even reverse, when the same data is sliced down to natural subgroups. The vice versa is also true, meaning
  a trend might appear in sugroups but vanish or reverse for the aggregate data. 

  It is not a glitch and it is not manipulation. It is a mathematical reality that shows up again and again in real systems, 
  from hiring pipelines to advertising platforms to healthcare to political redistricting. 
  Our goal is to let you discover this for yourself, not by reading about it in abstract, but by watching 
  it happen, live, in front of you. 
  </p>

  <p>
  
  </p>

  <p>
  Before diving into the interactive pieces, it helps to understand the shape of the problem we are chasing. 
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
    <footer>
    <p>
      <a href="https://github.com/bdoppalapudi/simpsons-fairness" target="_blank" rel="noopener">
        View source on GitHub
      </a>
    </p>
    <p class="contact-invite">
      Have thoughts on this, or just want to talk research over a cup of
      digital coffee? Reach out.
    </p>
    <p class="contact">
      Bhavana Doppalapudi &middot;
      <a href="mailto:bhavanadoppalapudi@gmail.com">Email</a> &middot;
      <a href="https://linkedin.com/in/doppalapudib" target="_blank" rel="noopener">LinkedIn</a> &middot;
      <a href="https://bhavanadoppalapudi.com/" target="_blank" rel="noopener">Website</a>
    </p>
  </footer>
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
  footer a {
    color: #6B4E9E;
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
  }
  .contact {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.5rem;
  }
  .contact-invite {
    font-size: 0.9rem;
    color: #666;
    margin-top: 1rem;
    margin-bottom: 0.3rem;
  }
</style>