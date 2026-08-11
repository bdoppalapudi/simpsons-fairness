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

  const UNIT_SAMPLE_SIZE = 150;
  let unitChartEl;

  $: unitRecords = generateAdData({
    totalImpressions: UNIT_SAMPLE_SIZE,
    imbalance: $imbalance
  });

  function drawUnits() {
    if (!unitChartEl) return;

    const width = 400;
    const iconScale = 3.5; // single source of truth for icon size and change this one number to resize everything
    const headRadius = iconScale;
    const bodyHeight = iconScale * 4.5;
    const rowSpacing = bodyHeight + iconScale * 5; // enough clearance to avoid overlap
    const colSpacing = iconScale * 7.5;

    const color = (d) => (d.group === 'A' ? '#6B4E9E' : '#2A9D8F');

    let positions;
    let requiredHeight;

    if (view === 'aggregate') {
      const cols = 15;
      const rows = Math.ceil(unitRecords.length / cols);
      requiredHeight = 30 + rows * rowSpacing + 20;

      positions = unitRecords.map((d, i) => ({
        ...d,
        x: 20 + (i % cols) * colSpacing,
        y: 30 + Math.floor(i / cols) * rowSpacing
      }));
    } else {
      const clusterWidth = width / 3;
      const catIndex = { Employment: 0, Housing: 1, Retail: 2 };
      const counters = { Employment: 0, Housing: 0, Retail: 0 };
      const colsPerCluster = 4;

      // Count icons per category first, so we know the worst-case
      // row count before laying anything out.
      const categoryCounts = { Employment: 0, Housing: 0, Retail: 0 };
      unitRecords.forEach((d) => categoryCounts[d.category]++);
      const maxCount = Math.max(...Object.values(categoryCounts));
      const maxRows = Math.ceil(maxCount / colsPerCluster);
      requiredHeight = 45 + maxRows * rowSpacing + 20;

      positions = unitRecords.map((d) => {
        const idx = counters[d.category]++;
        const clusterX = catIndex[d.category] * clusterWidth;
        return {
          ...d,
          x: clusterX + 25 + (idx % colsPerCluster) * colSpacing,
          y: 45 + Math.floor(idx / colsPerCluster) * rowSpacing
        };
      });
    }

    const svg = d3.select(unitChartEl);
    svg.attr('viewBox', `0 0 ${width} ${requiredHeight}`);

    const groups = svg.selectAll('.person').data(positions, (d, i) => i);

    const entered = groups.enter().append('g').attr('class', 'person');

    entered.append('circle').attr('class', 'head');
    entered.append('path').attr('class', 'body');

    const merged = entered.merge(groups);

    merged.transition().duration(600).attr('transform', (d) => `translate(${d.x},${d.y})`);

    merged.select('.head').attr('r', headRadius);

    merged
      .select('.body')
      .attr(
        'd',
        `M ${-headRadius * 1.3} ${headRadius * 1.5}
         Q 0 ${headRadius * 0.7} ${headRadius * 1.3} ${headRadius * 1.5}
         L ${headRadius * 1.3} ${bodyHeight}
         Q 0 ${bodyHeight * 1.15} ${-headRadius * 1.3} ${bodyHeight}
         Z`
      );

    merged
      .select('.head')
      .attr('fill', (d) => (d.delivered ? color(d) : 'none'))
      .attr('stroke', color)
      .attr('stroke-width', 1.2);

    merged
      .select('.body')
      .attr('fill', (d) => (d.delivered ? color(d) : 'none'))
      .attr('stroke', color)
      .attr('stroke-width', 1.2);

    svg.selectAll('.cluster-label').remove();
    if (view === 'sliced') {
      const clusterWidth = width / 3;
      ['Employment', 'Housing', 'Retail'].forEach((cat, i) => {
        svg
          .append('text')
          .attr('class', 'cluster-label')
          .attr('x', i * clusterWidth + clusterWidth / 2)
          .attr('y', 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(cat);
      });
    }
  }


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
    drawUnits();
  }

  onMount(draw);
  afterUpdate(draw);
</script>

<section class="act" id="act-2">
  <h2>{title}</h2>

  <p>
  Let's look closer this time and here, the story turns. Instead of looking only at the big picture, you are invited to 
  slice the same data by the type of ad being delivered, Employment ads, Housing ads, 
  and Retail ads. A toggle lets you switch between the aggregate view you just saw and 
  this new, more granular view. Alongside the toggle is a slider that controls how concentrated 
  each group is within these categories. Turn it up, and Group A becomes increasingly 
  funneled into certain categories while Group B becomes funneled into others. 
  </p>

  <p> 
  This is where the visualization does something a plain chart can't, it shows you the 
  actual people. A field of small human shaped icons represents the individuals in the 
  simulation, each colored by group membership, each either filled in (meaning they were 
  delivered the ad) or left hollow (meaning they werent delivered the ad). When you switch 
  from the aggregate view to the by-category view, you don't see a new chart appear out 
  of nowhere, you watch the very same icons glide from a single undivided crowd into three 
  distinct clusters, one per category. Nobody is added. Nobody disappears. The only thing that 
  changes is how they're grouped.
  </p>

  <p>
  As you experiment with the concentration slider, a quiet but important pattern emerges, within 
  any single category, Group A and Group B are treated almost identically. But because 
  Group A is disproportionately steered into certain categories, and those categories 
  happen to have different underlying delivery rates, the group level story you saw 
  prior starts to feel incomplete. 

  </p>


  <p class="predict">
    Before you click, what do you expect to happen when we split this
    same data by category? Take a guess, then find out.
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

  <div class="charts-row">
    <svg bind:this={chartEl} width="50%" height="320"></svg>
    <svg bind:this={unitChartEl} width="50%"></svg>
  </div>

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
  .charts-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }
  .charts-row svg {
    flex: 1;
    min-width: 0;
  }
  .predict {
    font-style: italic;
    color: #555;
    margin-top: 1rem;
  }
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
</style>