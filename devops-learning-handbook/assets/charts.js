(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  // --- Mermaid ---
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
  }

  // --- Chart: 各技能建议学习投入（周） ---
  var el = document.getElementById('chart-time');
  if (!el || !window.echarts) return;

  var skills = [
    ['Linux', 3], ['计算机网络', 2], ['Shell', 1.5], ['MySQL', 2],
    ['Nginx', 1.5], ['Git', 1], ['Docker', 2], ['监控与日志', 2],
    ['Ansible', 1], ['CI/CD', 1.5], ['Kubernetes', 3], ['Redis/MQ', 1.5],
    ['云计算', 1.5], ['Python+AI 运维', 2]
  ];
  var stageOf = function(name) {
    if (['Linux','计算机网络','Shell','MySQL'].indexOf(name) >= 0) return 0;
    if (['Nginx','Git','Docker','监控与日志'].indexOf(name) >= 0) return 1;
    if (['Ansible','CI/CD','Kubernetes','Redis/MQ'].indexOf(name) >= 0) return 2;
    return 3;
  };
  var stageColors = [accent, accent + 'B3', accent2 + 'B3', accent2];
  var stageNames = ['阶段一·基础', '阶段二·实战', '阶段三·进阶', '阶段四·竞争力'];

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      formatter: function(p) {
        return p.name + '：约 ' + p.value + ' 周（' + stageNames[stageOf(p.name)] + '）';
      }
    },
    grid: { left: 8, right: 40, top: 10, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      name: '周',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: skills.map(function(s) { return s[0]; }),
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: 14,
      label: { show: true, position: 'right', color: muted, fontSize: 11, formatter: '{c} 周' },
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: function(p) { return stageColors[stageOf(p.name)]; }
      },
      data: skills.map(function(s) { return s[1]; })
    }]
  });
  window.addEventListener('resize', function() { chart.resize(); });
})();
