<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { generateAdData } from '../utils/dataGenerator.js';
  import { totalImpressions } from '../stores.js';

  export let title = "1. The Aggregate Picture";


  let chartEl;

  function rate(arr) {
    if (!arr.length) return 0;
    return (arr.filter((r) => r.delivered).length / arr.length) * 100;
  }

  $: records = generateAdData({ totalImpressions: $totalImpressions, imbalance: 0.6 });
  $: groupARate = rate(records.filter((r) => r.group === 'A'));
  $: groupBRate = rate(records.filter((r) => r.group === 'B'));

  function drawChart() {
    if (!chartEl) return;

    const data = [
      { group: 'Group A', value: groupARate },
      { group: 'Group B', value: groupBRate }
    ];

    const width = 400,
      height = 250,
      margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select(chartEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.group))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'));

    svg
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.group))
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.value))
      .attr('fill', (d, i) => (i === 0 ? '#6B4E9E' : '#2A9D8F'));

    svg
      .selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', (d) => x(d.group) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.value) - 8)
      .attr('text-anchor', 'middle')
      .text((d) => d.value.toFixed(1) + '%');
  }

  onMount(drawChart);
  afterUpdate(drawChart);
</script>

<section class="act" id="act-1">
  <h2>{title}</h2>

  <p>
  The story opens the way most people would actually encounter this problem in real life,
  from top down. You are shown a simulated advertising delivery system delivering ads
   to two groups, Group A and Group B. A slider lets you control how many total ad impressions 
   are being simulated, and as you adjust it, you will notice something reassuring, the overall 
  delivery rates for Group A and Group B stays close to one another, no matter how large or 
  small the sample size gets.   

  </p>

  <p>
  There is nothing malicious and it is showing you the view most dashboards, most audits, and 
  most casual observers would actually see first. At this level, everything looks balanced, but "balanced overall" is 
  only one way to define fairness, and it's worth asking whether it's the right one before 
  accepting it as the final word.
  </p>

  <label class="slider-label">
    Total impressions simulated: {$totalImpressions.toLocaleString()}
    <input
      type="range"
      min="500"
      max="20000"
      step="500"
      bind:value={$totalImpressions}
    />
  </label>

  <svg bind:this={chartEl} width="100%" height="300"></svg>
</section>

<style>
  .act {
    min-height: 100vh;
    padding: 4rem 2rem;
  }
  .slider-label {
    display: block;
    margin: 1.5rem 0 0.5rem;
    font-size: 0.95rem;
    color: #444;
  }
  input[type='range'] {
    width: 100%;
    margin-top: 0.5rem;
  }
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
</style>