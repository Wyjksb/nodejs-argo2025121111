// assets/charts.js
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  var FONT = "'Work Sans','Noto Sans CJK SC','PingFang SC','Microsoft YaHei',sans-serif";
  var SERIF = "'Instrument Serif','Noto Serif CJK SC','Songti SC',serif";

  // --- Chart: equity donut ---
  var equityEl = document.getElementById('chart-equity');
  if (equityEl) {
    var equityData = [
      { name: '肖波', value: 39.15, capital: 900 },
      { name: '许育东', value: 26.1, capital: 600 },
      { name: '胡斐斐', value: 21.75, capital: 500 },
      { name: '共青城颛翌投资', value: 13.0, capital: 298.8506 }
    ];

    var equityChart = echarts.init(equityEl, null, { renderer: 'svg' });
    equityChart.setOption({
      animation: false,
      color: [accent, muted, ink, accent2],
      title: {
        text: '2,298.85',
        subtext: '万元 · 注册资本',
        left: 'center',
        top: '32%',
        textStyle: {
          fontFamily: SERIF,
          fontSize: 34,
          fontWeight: 400,
          color: ink
        },
        subtextStyle: {
          fontFamily: FONT,
          fontSize: 11,
          color: muted,
          lineHeight: 26
        }
      },
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg,
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontFamily: FONT, fontSize: 12 },
        formatter: function (p) {
          return p.marker + p.name + '<br/>持股 ' + p.value + '% · 认缴 ' + p.data.capital + ' 万元';
        }
      },
      legend: {
        bottom: 2,
        left: 'center',
        orient: 'horizontal',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 18,
        icon: 'circle',
        textStyle: { color: muted, fontFamily: FONT, fontSize: 11 },
        formatter: function (name) {
          var d = equityData.filter(function (x) { return x.name === name; })[0];
          return name + '  ' + d.value.toFixed(2).replace(/\.?0+$/, '') + '%';
        }
      },
      series: [{
        name: '股权结构',
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '43%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: bg, borderWidth: 3 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        data: equityData
      }]
    });

    window.addEventListener('resize', function () { equityChart.resize(); });
  }

  // --- Chart: headcount ---
  var headEl = document.getElementById('chart-headcount');
  if (headEl) {
    var headChart = echarts.init(headEl, null, { renderer: 'svg' });
    headChart.setOption({
      animation: false,
      grid: { left: 40, right: 18, top: 30, bottom: 34 },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg,
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontFamily: FONT, fontSize: 12 },
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: ['2024 年报', '2025 年报'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: FONT, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        max: 380,
        min: 0,
        interval: 100,
        axisLabel: { color: muted, fontFamily: FONT, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false }
      },
      series: [{
        name: '参保人数',
        type: 'bar',
        barWidth: 86,
        data: [
          { value: 240, itemStyle: { color: muted } },
          { value: 337, itemStyle: { color: accent } }
        ],
        itemStyle: { borderRadius: [2, 2, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 8,
          color: ink,
          fontFamily: SERIF,
          fontSize: 24
        }
      }]
    });

    window.addEventListener('resize', function () { headChart.resize(); });
  }
})();
