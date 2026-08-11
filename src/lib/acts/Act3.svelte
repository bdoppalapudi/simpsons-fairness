<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';
  import { generateAdData } from '../utils/dataGenerator.js';
  import { detectParadox, sweepImbalance } from '../utils/paradoxDetector.js';
  import { imbalance, totalImpressions } from '../stores.js';

  export let title = "3. Why It Happens";

  let sweepChartEl;
  let sweepData = [];

  // Reactive: same shared state Act 2 uses, so this stays in sync
  // as the reader scrolls between acts.
  $: records = generateAdData({
    totalImpressions: $totalImpressions,
    imbalance: $imbalance
  });

  $: paradoxStatus = detectParadox(records);

  // The sweep is expensive-ish (21 steps x 3 trials x data generation),
  // so we compute it once on mount rather than on every slider tick.
  onMount(() => {
    sweepData = sweepImbalance({ totalImpressions: $totalImpressions });
    drawSweepChart();
  });

  function drawSweepChart() {
    if (!sweepChartEl || !sweepData.length) return;

    const width = 500, height = 260, margin = { top: 20, right: 20, bottom: 40, left: 55 };
    const svg = d3.select(sweepChartEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yExtent = d3.extent(sweepData, (d) => d.gap);
    const y = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0]), Math.max(0, yExtent[1])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.0%')));
    svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    // Zero-line reference — the paradox "crosses over" relative to this
    svg.append('line')
      .attr('x1', margin.left).attr('x2', width - margin.right)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#ccc').attr('stroke-dasharray', '4,4');

    const line = d3.line()
      .x((d) => x(d.imbalance))
      .y((d) => y(d.gap));

    svg.append('path')
      .datum(sweepData)
      .attr('fill', 'none')
      .attr('stroke', '#6B4E9E')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Marker for the reader's current slider position
    const currentPoint = sweepData.reduce((closest, d) =>
      Math.abs(d.imbalance - $imbalance) < Math.abs(closest.imbalance - $imbalance) ? d : closest
    );
    svg.append('circle')
      .attr('cx', x(currentPoint.imbalance))
      .attr('cy', y(currentPoint.gap))
      .attr('r', 6)
      .attr('fill', '#2A9D8F');
  }

  afterUpdate(drawSweepChart);
</script>

<section class="act" id="act-3">
  <h2>{title}</h2>

  <p>
  Seeing the reversal is one thing, understanding why it's mathematically inevitable is another. 
  The mechanism is explained plainly, using both a live diagnostic tool and a 
  fully worked numerical example.
  </p>

  <p>
  The diagnostic tool is a simple status indicator that continuously checks the current data and 
  tells you, in real time, whether the paradox condition currently holds: "Present" or "Absent" based 
  on the same slider you were adjusting in The Reversal example. Next to it sits a small line chart 
  that sweeps across every possible concentration level, from perfectly even to maximally skewed, and 
  plots the resulting gap between Group A and Group B at each point. A single dot marks exactly where 
  the slider setting falls on that curve. This turns an abstract idea "the paradox appears at some level 
  of imbalance", into something provable and precise: you can watch the exact moment the gap crosses from 
  negligible into significant. 
  </p>

  <div class="status" class:present={paradoxStatus.paradoxPresent}>
    Paradox: <strong>{paradoxStatus.paradoxPresent ? 'Present' : 'Absent'}</strong>
  </div>

  <p class="detail">
    Within each category, the groups are roughly {paradoxStatus.categoryConsensus === 'tie' ? 'tied' : `favoring Group ${paradoxStatus.categoryConsensus}`}.
    Overall, the aggregate favors {paradoxStatus.aggDirection === 'tie' ? 'neither group' : `Group ${paradoxStatus.aggDirection}`}.
  </p>

  <label class="slider-label">
    Concentration imbalance: {($imbalance * 100).toFixed(0)}%
    <input type="range" min="0" max="1" step="0.05" bind:value={$imbalance} />
  </label>

  <h4>Where the crossover happens:</h4>
  <p class="detail">
    This chart shows the aggregate gap (Group A rate minus Group B rate) across
    every possible imbalance level. The dot marks where your current slider sits.
  </p>
  <svg bind:this={sweepChartEl} width="100%" height="280"></svg>

  <h4>A worked example</h4>
  <p class="detail">
    Picture 100 people in each group. In the 
    Employment Category, both groups get the ad at the same 20 percent rate, but 60 
    of Group A'S 100 people fall into that category, compared to only 10 of Group B's. 
    The same pattern repeats in Housing, at a 30 percent rate, and Retail, at a much 
    higher 80 percent rate, with the group compositions again skewed in opposite directions. 
    When you multiply out each category's rate by how many people from each group 
    actually landed there, and add up the results, Group A ends up with a 29 percent 
    overall delivery rate, while Group B ends up at 64 percent, a 35 point gap, despite 
    individual category treating both groups identically. The math isn't a trick, it's 
    simply what happens when you average numbers that are weighted very differently. 

  </p>
  <p>
    Within every category, the same fraction of
    each group gets the ad. Only the number of people <em>in</em> each
    category differs between groups.
  </p>

  <table class="worked-example">
    <thead>
      <tr>
        <th>Category</th>
        <th>Delivery rate (same for both groups)</th>
        <th>Group A: people in this category </th>
        <th>Group B: people in this category </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Employment </td>
        <td>20% get the ad</td>
        <td>60 people </td>
        <td>10 people </td>
      </tr>
      <tr>
        <td>Housing </td>
        <td>30% get the ad</td>
        <td>30 people </td>
        <td>20 people </td>
      </tr>
      <tr>
        <td>Retail </td>
        <td>80% get the ad</td>
        <td>10 people </td>
        <td>70 people </td>
      </tr>
      <tr class="totals-row">
        <td><strong>Total</strong></td>
        <td>—</td>
        <td><strong>100 people </strong></td>
        <td><strong>100 people </strong></td>
      </tr>
    </tbody>
  </table>
  <p class="detail">
    Now apply each category's rate to those head counts, to see how many
    people actually got the ad:
  </p>

  <div class="calc">
    <p>
      <strong>Group A:</strong>
      Employment: 60 × 20% = 12 &nbsp;|&nbsp;
      Housing: 30 × 30% = 9 &nbsp;|&nbsp;
      Retail: 10 × 80% = 8
    </p>
    <p>
      → Total delivered: 12 + 9 + 8 = 29 out of 100 = <strong>29%</strong>
    </p>
    <p>
      <strong>Group B:</strong>
      Employment: 10 × 20% = 2 &nbsp;|&nbsp;
      Housing: 20 × 30% = 6 &nbsp;|&nbsp;
      Retail: 70 × 80% = 56
    </p>
    <p>
      → Total delivered: 2 + 6 + 56 = 64 out of 100 = <strong>64%</strong>
    </p>
    <p class="calc-note">
      Same rate in every category. A 35-point gap overall — purely from
      how many of each group landed in each category.
    </p>
  </div>

</section>

<style>
  .act { min-height: 100vh; padding: 4rem 2rem; }
  .status {
    display: inline-block; padding: 0.5rem 1rem; border-radius: 6px;
    background: #eee; margin: 1rem 0; font-size: 1rem;
  }
  .status.present { background: #fde2e2; }
  .detail { font-size: 0.9rem; color: #555; }
  .slider-label { display: block; margin: 1.5rem 0 0.5rem; font-size: 0.95rem; color: #444; }
  input[type='range'] { width: 100%; margin-top: 0.5rem; }
  .worked-example {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.9rem;
  }
  .worked-example th, .worked-example td {
    border: 1px solid #ddd;
    padding: 0.5rem 0.75rem;
    text-align: left;
  }
  .worked-example th {
    background: #f5f5f5;
  }
  .calc {
    background: #f9f9f7;
    border-radius: 6px;
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
  }
  .calc p {
    margin: 0.4rem 0;
  }
  .calc-note {
    color: #666;
    font-style: italic;
  }
  .totals-row td {
    background: #f5f5f5;
    border-top: 2px solid #999;
  }
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
</style>