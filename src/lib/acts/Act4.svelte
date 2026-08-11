<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { generateAdData } from '../utils/dataGenerator.js';
  import { imbalance, totalImpressions } from '../stores.js';

  export let title = "4. Even the Fairness Metric Isn't Safe";

  let metric = 'parity'; //'parity' || 'equilized'
  let chartEl;

  function rate(arr) {
    if (!arr.length) return 0;
    return (arr.filter((r) => r.delivered).length / arr.length) * 100;

  }
  
  $: records = generateAdData({
    totalImpressions: $totalImpressions,
    imbalance: $imbalance
  });

  //Demographic Parity showing raw delivery rate
  $: parityA = rate(records.filter((r) => r.group === 'A'));
  $: parityB = rate(records.filter((r) => r.group === 'B'));

  //Equalized odds shows delivery rate filtered to ony relevant cases
  $: relevantRecords = records.filter((r) => r.relevant);
  $: equalizedA = rate(relevantRecords.filter((r) => r.group === 'A'));
  $: equalizedB = rate(relevantRecords.filter((r) => r.group === 'B'));

  $: currentA = metric === 'parity' ? parityA : equalizedA;
  $: currentB = metric === 'parity' ? parityB : equalizedB;

  const GAP_TOLERANCE = 3;
  $: gap = Math.abs(currentA - currentB);
  $: passes = gap <= GAP_TOLERANCE;

  function draw() {
    if (!chartEl) return;
    const data = [
      {group: 'Group A', value: currentA},
      {group: 'Group B', value: currentB}
    ];
    const width = 400, height = 250, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const svg = d3.select(chartEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleBand().domain(data.map((d) => d.group))
      .range([margin.left, width - margin.right]).padding(0.4);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'));

    svg.selectAll('.bar').data(data).join('rect').attr('class', 'bar')
      .attr('x', (d) => x(d.group)).attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth()).attr('height', (d) => y(0) - y(d.value))
      .attr('fill', (d, i) => (i === 0 ? '#6B4E9E' : '#2A9D8F'));

    svg.selectAll('.label').data(data).join('text').attr('class', 'label')
      .attr('x', (d) => x(d.group) + x.bandwidth() / 2).attr('y', (d) => y(d.value) - 8)
      .attr('text-anchor', 'middle').text((d) => d.value.toFixed(1) + '%');
  }

  onMount(draw);
  afterUpdate(draw);
  
</script>

<section class="act" id="act-4">
  <h2>{title}</h2>
  <p>
  Back in example 1, we asked whether "balanced overall" was really the right bar for fairness to clear, 
  here's where that question finally gets answered, and the answer turns out to depend on which definition of
  "fair" you're using. It turns out that "fair" isn't a single, fixed standard and it depends entirely on which 
  definition of fairness you are applying, and the exact same dataset can satisfy one definition while 
  failing another. 

  </p>
  <p>
    Two metrics: 1. Demographic Parity, and 2. Equalized Odds, are used side by side to demonstrate the 
    fainess on the same dataset. Demographic Parity asks a simple, unconditional question: do both groups 
    get shown the ad at the same overall rate, full stop, regardess of whether the ad was actually a good 
    match for them? Equalized Odds asks a more careful question: among the people the ad was genuinely 
    relevant to, do both the groups get shown it at the same rate? A toggle lets you switch between these 
    two lenses while the underlying concentration slider stays exactly where you left it, so you can watch 
    both metrics respond to the same conditions. 
  </p>
  <p>
    What you will find is that Demographic Parity can report "fair" even as Equalized Odds reports "not fair" 
    on the very same data. This isn't a bug in either metric, it is a reflection of the fact that they are 
    answering genuinely different questions, and a system can honestly satisfy one while falling short of 
    the other. 
  </p>

  <div class="toggle">
    <button class:active={metric === 'parity'} on:click={() => (metric = 'parity')}>
      Demographic Parity
    </button>
    <button class:active={metric === 'equalized'} on:click={() => (metric = 'equalized')}>
      Equalized Odds
    </button>
  </div>

  <p class="detail">
    {#if metric === 'parity'}
      Comparing overall delivery rates, everyone counted, regardless of relevance.
    {:else}
      Comparing delivery rates only among people the ad was actually relevant to.
    {/if}
  </p>

  <div class="status" class:present={!passes}>
    This metric says: <strong>{passes ? 'Fair' : 'Not Fair'}</strong>
    (gap: {gap.toFixed(1)} points)
  </div>

  <svg bind:this={chartEl} width="100%" height="300"></svg>

  <label class="slider-label">
    Concentration imbalance: {($imbalance * 100).toFixed(0)}%
    <input type="range" min="0" max="1" step="0.05" bind:value={$imbalance} />
  </label>
</section>

<style>
  .act { min-height: 100vh; padding: 4rem 2rem; }
  .toggle { margin: 1.5rem 0; }
  .toggle button {
    padding: 0.5rem 1rem; margin-right: 0.5rem; border: 1px solid #ccc;
    background: #fff; border-radius: 6px; cursor: pointer;
  }
  .toggle button.active { background: #333; color: #fff; border-color: #333; }
  .detail { font-size: 0.9rem; color: #555; }
  .status {
    display: inline-block; padding: 0.5rem 1rem; border-radius: 6px;
    background: #eee; margin: 1rem 0; font-size: 1rem;
  }
  .status.present { background: #fde2e2; }
  .slider-label { display: block; margin: 1.5rem 0 0.5rem; font-size: 0.95rem; color: #444; }
  input[type='range'] { width: 100%; margin-top: 0.5rem; }
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
</style>
