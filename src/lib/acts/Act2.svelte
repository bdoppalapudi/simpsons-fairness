<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { generateAdData, CATEGORIES } from '../utils/dataGenerator.js';
  import { imbalance, totalImpressions } from '../stores.js';

  export let title = "2. The Reversal";

  let view = 'aggregate'; // 'aggregate' | 'sliced'
  let chartEl;

  function rate(arr) {
    if (!arr.length) return 0;
    return (arr.filter((r) => r.delivered).length / arr.length) * 100;
  }

  // Reactive: regenerates whenever the shared imbalance or impressions change
  $: records = generateAdData({
    totalImpressions: $totalImpressions,
    imbalance: $imbalance
  });

  $: groupARate = rate(records.filter((r) => r.group === 'A'));
  $: groupBRate = rate(records.filter((r) => r.group === 'B'));

  // Category composition per group — the "show the boundaries" readout
  $: composition = (() => {
    const result = {};
    ['A', 'B'].forEach((g) => {
      const groupRecords = records.filter((r) => r.group === g);
      result[g] = CATEGORIES.map((cat) => ({
        category: cat,
        pct: groupRecords.length
          ? (groupRecords.filter((r) => r.category === cat).length / groupRecords.length) * 100
          : 0
      }));
    });
    return result;
  })();

  // Sliced data: delivery rate per category per group
  $: sliced = CATEGORIES.map((cat) => {
    const inCat = records.filter((r) => r.category === cat);
    return {
      category: cat,
      A: rate(inCat.filter((r) => r.group === 'A')),
      B: rate(inCat.filter((r) => r.group === 'B'))
    };
  });

  function drawAggregate() {
    const data = [
      { group: 'Group A', value: groupARate },
      { group: 'Group B', value: groupBRate }
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

  function drawSliced() {
    const width = 500, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const svg = d3.select(chartEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x0 = d3.scaleBand().domain(CATEGORIES)
      .range([margin.left, width - margin.right]).padding(0.3);
    const x1 = d3.scaleBand().domain(['A', 'B']).range([0, x0.bandwidth()]).padding(0.1);
    const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x0));
    svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'));

    const catGroups = svg.selectAll('.cat-group').data(sliced).join('g')
      .attr('transform', (d) => `translate(${x0(d.category)},0)`);

    catGroups.each(function (d) {
      const g = d3.select(this);
      const bars = [
        { key: 'A', value: d.A },
        { key: 'B', value: d.B }
      ];
      g.selectAll('rect').data(bars).join('rect')
        .attr('x', (b) => x1(b.key)).attr('y', (b) => y(b.value))
        .attr('width', x1.bandwidth()).attr('height', (b) => y(0) - y(b.value))
        .attr('fill', (b) => (b.key === 'A' ? '#6B4E9E' : '#2A9D8F'));

      g.selectAll('text').data(bars).join('text')
        .attr('x', (b) => x1(b.key) + x1.bandwidth() / 2).attr('y', (b) => y(b.value) - 6)
        .attr('text-anchor', 'middle').attr('font-size', '11px')
        .text((b) => b.value.toFixed(0) + '%');
    });
  }

  function draw() {
    if (!chartEl) return;
    view === 'aggregate' ? drawAggregate() : drawSliced();
  }

  onMount(draw);
  afterUpdate(draw);
</script>

<section class="act" id="act-2">
  <h2>{title}</h2>
  <p>
    Let's look closer this time, split by the type of ad being delivered:
    Employment, Housing, or Retail.
  </p>

  <div class="toggle">
    <button class:active={view === 'aggregate'} on:click={() => (view = 'aggregate')}>
      Aggregate
    </button>
    <button class:active={view === 'sliced'} on:click={() => (view = 'sliced')}>
      By Category
    </button>
  </div>

  <label class="slider-label">
    Concentration imbalance: {($imbalance * 100).toFixed(0)}%
    <span class="hint">(0% = evenly spread across categories, 100% = highly concentrated)</span>
    <input type="range" min="0" max="1" step="0.05" bind:value={$imbalance} />
  </label>

  <svg bind:this={chartEl} width="100%" height="320"></svg>

  <div class="composition">
    <h4>Where each group actually lands:</h4>
    {#each ['A', 'B'] as g}
      <p>
        <strong>Group {g}:</strong>
        {#each composition[g] as c, i}{c.category} {c.pct.toFixed(0)}%{#if i < composition[g].length - 1}, {/if}{/each}
      </p>
    {/each}
  </div>
</section>

<style>
  .act { min-height: 100vh; padding: 4rem 2rem; }
  .toggle { margin: 1.5rem 0; }
  .toggle button {
    padding: 0.5rem 1rem; margin-right: 0.5rem; border: 1px solid #ccc;
    background: #fff; border-radius: 6px; cursor: pointer;
  }
  .toggle button.active { background: #333; color: #fff; border-color: #333; }
  .slider-label { display: block; margin: 1.5rem 0 0.5rem; font-size: 0.95rem; color: #444; }
  .hint { display: block; font-size: 0.8rem; color: #888; font-weight: normal; }
  input[type='range'] { width: 100%; margin-top: 0.5rem; }
  .composition { margin-top: 1.5rem; font-size: 0.9rem; color: #555; }
</style>