function setupYearly(CalHeatMap, yearData, legend) {
  var cal = new CalHeatMap(),
      today = new Date(),
      start = new Date();

  start.setFullYear(start.getFullYear() - 1, start.getMonth() + 1);

  cal.init({
    itemSelector: "#heatmap",
    data: yearData,
    dataType: 'json',
    domain: 'month',
    subDomain: 'day',
    domainGutter: 5,
    rowLimit: 7,
    start: start,
    legend: legend,
    itemName: ["word", "words"],
    subDomainTitleFormat: {
      empty: 'No word written on {date}',
      filled: '{count} {name} written {connector} {date}'
    },
    tooltip: true,
    highlight: today,
    domainLabelFormat: '%b-%y',
    cellSize: 11
  });
}
