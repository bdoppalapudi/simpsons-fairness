<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // 25 voters, fixed: 13 red, 12 blue, same data for both plans
  const voters = [
    'R','R','R','R','R','R','R','R','R','R','R','R','R',
    'B','B','B','B','B','B','B','B','B','B','B','B'
  ];

  // Plan A: cracks Blue thin across 4 districts, packs the rest into 1.
  // Result: Red wins 4 districts to 1.
  const planA = [
    [0, 1, 2, 3, 13],
    [4, 5, 6, 14, 15],
    [7, 8, 9, 16, 17],
    [10, 11, 12, 18, 19],
    [20, 21, 22, 23, 24]
  ];

  // Plan B: packs Blue into 3 winnable districts, concedes 2 all-Red
  // districts. Result: Blue wins 3 districts to 2, a different
  // majority winner, from the exact same 25 voters.
  const planB = [
    [13, 14, 15, 16, 0],
    [17, 18, 19, 20, 1],
    [21, 22, 23, 24, 2],
    [3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12]
  ];

  let plan = 'A';
  let chartEl;

  function districtWinner(districtIndices) {
    const counts = districtIndices.reduce(
      (acc, i) => {
        acc[voters[i]]++;
        return acc;
      },
      { R: 0, B: 0 }
    );
    return counts.R > counts.B ? 'R' : 'B';
  }

  $: currentPlan = plan === 'A' ? planA : planB;
  $: winners = currentPlan.map(districtWinner);
  $: redDistricts = winners.filter((w) => w === 'R').length;
  $: blueDistricts = winners.filter((w) => w === 'B').length;
  $: overallWinner = winners.filter((w) => w === 'R').length >= 3 ? 'Red' : 'Blue';

  function draw() {
    if (!chartEl) return;
    const width = 300, height = 300, cell = 50;
    const svg = d3.select(chartEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const districtColors = ['#6B4E9E', '#2A9D8F', '#E76F51', '#457B9D', '#E9C46A'];

    currentPlan.forEach((districtIndices, dIdx) => {
      districtIndices.forEach((voterIdx) => {
        const row = Math.floor(voterIdx / 5);
        const col = voterIdx % 5;
        const g = svg.append('g')
          .attr('transform', `translate(${col * cell},${row * cell})`);

        g.append('rect')
          .attr('width', cell).attr('height', cell)
          .attr('fill', voters[voterIdx] === 'R' ? '#f4a6a6' : '#a6c8f4')
          .attr('stroke', districtColors[dIdx])
          .attr('stroke-width', 4);

        g.append('text')
          .attr('x', cell / 2).attr('y', cell / 2 + 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .text(voters[voterIdx]);
      });
    });
  }

  onMount(draw);
  afterUpdate(draw);
</script>

<section class="coda">
  <h2>One More Place You've Seen This</h2>
  <p>
    Here are the same 25 voters, 13 red, 12 blue that are arranged into 5 districts
    two different ways. Nobody moved. Nobody changed their vote. Only the
    district lines changed.
  </p>

  <div class="toggle">
    <button class:active={plan === 'A'} on:click={() => (plan = 'A')}>Plan A</button>
    <button class:active={plan === 'B'} on:click={() => (plan = 'B')}>Plan B</button>
  </div>

  <svg bind:this={chartEl} width="300" height="300"></svg>

  <p class="result">
    Districts won: <strong>{redDistricts} Red, {blueDistricts} Blue</strong>
    → Overall winner: <strong>{overallWinner}</strong>
  </p>

  <p>
    Same voters. Same votes. Different lines, different winner, the same
    underlying pattern you just explored with ad delivery.
  </p>
</section>

<style>
  .coda { min-height: 70vh; padding: 4rem 2rem; }
  .toggle { margin: 1rem 0; }
  .toggle button {
    padding: 0.5rem 1rem; margin-right: 0.5rem; border: 1px solid #ccc;
    background: #fff; border-radius: 6px; cursor: pointer;
  }
  .toggle button.active { background: #333; color: #fff; border-color: #333; }
  .result { font-size: 1.1rem; margin-top: 1rem; }
</style>