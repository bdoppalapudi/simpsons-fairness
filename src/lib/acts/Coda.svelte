<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  // 25 voters, fixed: 13 red, 12 blue, same data for both plans
  // Row-major order: index = row*5 + col
  const voters = [
    'B','B','R','R','R',
    'B','R','B','R','R',
    'R','B','B','R','R',
    'B','B','R','R','R',
    'B','B','B','R','B'
  ];

  // Plan A: districts = rows (each row is a contiguous strip)
  const planA = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24]
  ];

  // Plan B: districts = columns (each column is a contiguous strip)
  const planB = [
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24]
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
    To close, let us step outside the world of advertising algorithm entirely, to that the same 
    mathematical pattern shows up in a very different, very human context: the drawing of political 
    district lines. Using a small fixed set of twenty five voters, thirteen leaning one way and twelve 
    the other, we show two different ways of grouping those exact same voters into five districts. 
    Nobody moves, nobody changes their vote, and yet depending purely on where the district lines are 
    drawn, the overall majority winner can flip entirely. It is a brief self contained aside rather than 
    a full second investigation, included specifically to make the point that this isn't a quirk unique 
    to ad delivery or machine learning. It's a general feature of how aggregation and grouping interact 
    with any unevenly distributed population. 
  </p>

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

  <p>
  What ties all of this together is a single, uncomfortable insight: fairness, at 
  a level of a headline number, can be a mirage. Not because anyone is cheating 
  the system, but because they way data gets grouped and summarized carries hidden 
  assumptions about which comparisons matters. A system can be entirely fair within 
  every category you check, and still produce a deeply unequal outcome overall, or 
  the vice-versa. The only way to catch this is to look closer, to ask which slice 
  of the data you are actually examining, and to stay skeptical of any single number 
  that claims to settle the question of fairness on its own. 
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
  p {
    margin-bottom: 1rem;
    text-align: left;
  }
</style>