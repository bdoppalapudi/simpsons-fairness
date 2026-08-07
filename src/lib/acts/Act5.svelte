<script>
  export let title = "5. What To Actually Do About It";
</script>

<section class="act" id="act-5">
  <h2>{title}</h2>

  <p>
    Nothing about the data you just explored was rigged. No group was ever
    favored in the delivery logic itself, and every gap you saw emerged purely
    from <em>how</em> the groups were distributed across ad categories, and
    <em>which</em> fairness definition you happened to check.
  </p>

  <p>
    That's the uncomfortable part: a system can be technically "fair" by one
    measure and clearly unfair by another, using the exact same underlying
    data. Neither answer is wrong, they are just answering different
    questions.
  </p>

  <p>A few things worth carrying forward:</p>

  <ul>
    <li>
      <strong>Aggregate numbers can hide as much as they reveal.</strong>
      Always check whether a "fair" overall statistic holds up when you slice
      by the categories that matter for your system.
    </li>
    <li>
      <strong>Know which fairness definition you're actually checking.</strong>
      Demographic Parity and Equalized Odds can and do disagree, so decide
      up front which one matches what you're trying to guarantee, rather
      than reaching for whichever one happens to pass.
    </li>
    <li>
      <strong>How you group and aggregate data is itself a decision,</strong> 
      not a neutral default. It shapes what conclusions are even possible to
      see.
    </li>
  </ul>

  <p>
    This pattern isn't unique to ad delivery, or even to machine learning —
    it shows up anywhere data gets aggregated across unevenly distributed
    groups.
  </p>
</section>

<style>
  .act {
    min-height: 60vh;
    padding: 4rem 2rem;
  }
  ul {
    padding-left: 1.2rem;
  }
  li {
    margin-bottom: 1rem;
  }
</style>